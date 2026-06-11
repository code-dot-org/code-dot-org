# Running Device Farm UI tests against localhost

AWS Device Farm runs browsers inside AWS, so by default it cannot reach a
dashboard server on a developer's workstation -- the workstation has no public
IP or DNS name. SauceLabs solves this with Sauce Connect (`bin/sauce_connect`);
Device Farm has no equivalent tunnel.

This document describes a bastion-based equivalent. A small EC2 instance in the
**codeorg-dev** account sits in a VPC that Device Farm can reach over its
VPC-ENI connectivity. A developer opens a reverse SSH tunnel from the bastion
back to their workstation, and Device Farm's Chrome is pointed at the bastion's
private IP via Chrome's `--host-resolver-rules`. The dev account is used (rather
than prod) deliberately: it keeps new inbound SSH paths away from the account
that holds production user data, at the cost of an `AWS_PROFILE=codeorg-dev`
prefix on the run command.

## How it works

```
  workstation                          codeorg-dev VPC (us-west-2)
  ┌───────────────┐                    ┌──────────────────────────────┐
  │ puma :3000    │                    │  bastion EC2                 │
  │ (dashboard)   │◀── reverse SSH ────│  sshd, listens 0.0.0.0:3000  │
  │               │    tunnel (-R)     │  (GatewayPorts)              │
  │ bin/device_   │───────────────────▶│         ▲                    │
  │ farm_tunnel   │                    │         │ :3000 (in-VPC)     │
  └───────────────┘                    │   ┌─────┴───────────────┐    │
                                       │   │ Device Farm ENI     │    │
                                       │   │ (Chrome session)    │    │
                                       │   └─────────────────────┘    │
                                       └──────────────────────────────┘
```

1. The test navigates Chrome to `http://localhost-studio.code.org:3000`.
2. `--host-resolver-rules` (set in `runner.rb`'s cucumber support, see
   `features/support/connect.rb`) rewrites `localhost-studio.code.org` and
   `localhost.code.org` to the bastion's **private** IP -- which `runner.rb`
   resolves at run time by Name-tag lookup (see "Per-developer setup").
3. Chrome dials `bastion-private-ip:3000` over the Device Farm ENI in the VPC.
4. The bastion's reverse-forwarded listener relays that to `localhost:3000` on
   the workstation, where puma is bound.
5. puma sees `Host: localhost-studio.code.org:3000`, already an allowed host in
   `dashboard/config/environments/development.rb`.

The port stays `3000` end to end: `--host-resolver-rules` rewrites only the
host, not the port, so the bastion must listen on the same port the tests dial.

---

## One-time AWS setup (codeorg-dev)

Run everything against the dev account and Device Farm's only region, us-west-2:

```bash
export AWS_PROFILE=codeorg-dev
export AWS_REGION=us-west-2
```

Substitute the placeholders (`<vpc-id>`, `<subnet-id>`, ...) with real values as
you go.

### 1. Choose a VPC and subnet

Device Farm desktop (TestGrid) browser sessions reach private resources by
attaching an ENI in a subnet you nominate. Pick (or create) a VPC and at least
one subnet in us-west-2 to hold both the Device Farm ENI and the bastion. The
default VPC is fine for a throwaway bastion.

The session ENI follows that subnet's route table. The dashboard pages under
test typically pull external resources (fonts, CDN assets), so the subnet needs
outbound internet -- a public subnet (IGW route), or a private subnet with a NAT
gateway. A private subnet with no egress will load the app only partially and
tests will fail in confusing ways.

```bash
aws ec2 describe-vpcs    --query 'Vpcs[].{id:VpcId,cidr:CidrBlock,default:IsDefault}' --output table
aws ec2 describe-subnets --filters Name=vpc-id,Values=<vpc-id> \
  --query 'Subnets[].{id:SubnetId,az:AvailabilityZone,cidr:CidrBlock}' --output table
```

### 2. Security groups

Two security groups keep the two traffic flows separate:

- **`df-bastion-sg`** -- attached to the bastion.
- **`df-eni-sg`** -- attached to the Device Farm session ENI (referenced in the
  TestGrid project's VPC config in step 5).

```bash
BASTION_SG=$(aws ec2 create-security-group --group-name df-bastion-sg \
  --description "Device Farm local-test bastion" --vpc-id <vpc-id> \
  --query GroupId --output text)

ENI_SG=$(aws ec2 create-security-group --group-name df-eni-sg \
  --description "Device Farm session ENI" --vpc-id <vpc-id> \
  --query GroupId --output text)

# Device Farm reaches the bastion's forwarded dashboard port only from the ENI.
aws ec2 authorize-security-group-ingress --group-id "$BASTION_SG" \
  --protocol tcp --port 3000 --source-group "$ENI_SG"

# SSH for the reverse tunnel. Prefer SSM (step 4, no inbound 22 at all). If you
# must open 22, scope it to known developer egress IPs, never 0.0.0.0/0:
# aws ec2 authorize-security-group-ingress --group-id "$BASTION_SG" \
#   --protocol tcp --port 22 --cidr <your-ip>/32
```

`df-eni-sg` needs no inbound rules; its default egress (allow all) lets Chrome
dial the bastion.

### 3. Launch the bastion

A burstable nano instance is plenty -- it only relays one TCP stream.

```bash
aws ec2 run-instances \
  --image-id <recent-al2023-ami-id> \
  --instance-type t4g.nano \
  --subnet-id <subnet-id> \
  --security-group-ids "$BASTION_SG" \
  --iam-instance-profile Name=<ssm-managed-instance-profile> \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=device-farm-bastion}]'
```

Notes:
- `t4g.nano` is arm64; pick an arm64 AL2023 AMI (`al2023-ami-*-arm64`). For an
  x86 AMI use `t3.nano` instead.
- The instance profile should grant `AmazonSSMManagedInstanceCore` so you can
  reach it via SSM (step 4) without a public IP.
- Keep the `Name=device-farm-bastion` tag: `runner.rb` looks the bastion up by
  that tag to find its private IP at run time (see "Per-developer setup"), so
  you never hand-maintain the IP. The instance's private IP is stable across
  stop/start anyway; only a terminate-and-relaunch would change it, and the
  tag lookup absorbs even that.

### 4. SSH access to the bastion

**Recommended -- SSM, no inbound 22.** With the SSM-managed instance profile and
the [Session Manager plugin][ssm-plugin] installed locally, add to `~/.ssh/config`:

```
Host device-farm-bastion
  User ec2-user
  HostName <instance-id>
  ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p --profile codeorg-dev --region us-west-2"
```

Then `ssh device-farm-bastion` works with zero open ports. (You still need an SSH
key in the instance's `authorized_keys`; push one with EC2 Instance Connect or
bake it into the AMI/user-data.)

**Simpler -- public IP + restricted SG.** Give the bastion a public IP, open
port 22 in `df-bastion-sg` to your `/32` only, and use
`Host device-farm-bastion / HostName <public-dns>` in `~/.ssh/config`.

[ssm-plugin]: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html

#### Enable GatewayPorts on the bastion

The reverse tunnel must bind the bastion's listener on all interfaces (not just
loopback) so the Device Farm ENI can reach it. On the bastion:

```bash
echo 'GatewayPorts clientspecified' | sudo tee /etc/ssh/sshd_config.d/60-gatewayports.conf
sudo systemctl restart sshd
```

`clientspecified` lets `bin/device_farm_tunnel`'s `-R 0.0.0.0:3000:...` bind the
listener publicly; the `df-bastion-sg` rule from step 2 is what actually limits
who can connect.

### 5. Device Farm desktop (TestGrid) project with VPC config

Create a desktop browser project dedicated to local-dev testing so its VPC
config stays independent of the CI project:

```bash
aws devicefarm create-test-grid-project \
  --region us-west-2 \
  --name cdo-ui-tests-local-dev \
  --vpc-config "securityGroupIds=$ENI_SG,subnetIds=<subnet-id>,vpcId=<vpc-id>"
```

This prints the project ARN -- that is `device_farm_desktop_project_arn` for
local runs. To attach VPC config to an existing project instead, use
`aws devicefarm update-test-grid-project --project-arn <arn> --vpc-config ...`.

---

## Per-developer setup

Add to `locals.yml` at the repo root:

```yaml
# ARN from "create-test-grid-project" above
device_farm_desktop_project_arn: 'arn:aws:devicefarm:us-west-2:<acct>:testgrid-project:<uuid>'
# the SSH destination for bin/device_farm_tunnel (alias from ~/.ssh/config above)
device_farm_bastion_ssh: 'device-farm-bastion'
```

You do **not** configure the bastion's private IP. On each run, `runner.rb`
looks it up via `ec2:DescribeInstances`, filtering for the one running instance
tagged `Name=device-farm-bastion` (override the tag with `device_farm_bastion_name`).
This needs `ec2:DescribeInstances` on your dev-account profile -- a read-only
permission most engineers already have. To opt out of the lookup, pin the IP
with `device_farm_bastion_ip: '10.0.x.x'` instead.

Confirm your dev-account credentials resolve and the lookup will find the host:

```bash
AWS_PROFILE=codeorg-dev aws sts get-caller-identity
AWS_PROFILE=codeorg-dev aws ec2 describe-instances --region us-west-2 \
  --filters Name=tag:Name,Values=device-farm-bastion Name=instance-state-name,Values=running \
  --query 'Reservations[].Instances[].PrivateIpAddress' --output text
```

---

## Running a test

Three terminals (all from the repo, except the runner which is run from
`dashboard/test/ui`):

```bash
# 1. dashboard server (binds 0.0.0.0:3000)
bin/dashboard-server

# 2. reverse tunnel to the bastion (leave running)
bin/device_farm_tunnel

# 3. the UI test, against localhost, on Device Farm Chrome
cd dashboard/test/ui
AWS_PROFILE=codeorg-dev ./runner.rb --device-farm -l -c Chrome \
  -f features/sign_in.feature --html
```

- `--device-farm` selects Device Farm; `-c Chrome` picks the desktop Chrome
  config from `browsers_device_farm.json`. Localhost runs are Chrome-only --
  the host rewrite uses Chrome's `--host-resolver-rules`, which Firefox has no
  equivalent for.
- `-l` sets the localhost domains (`localhost-studio.code.org:3000`,
  `localhost.code.org:3000`). Combined with `-c`, it keeps those domains while
  still using the remote browser (not the local chromedriver).
- `AWS_PROFILE=codeorg-dev` keeps the run on the dev account; without it the
  AWS SDK would default to most developers' prod profile.
- The bastion IP is resolved automatically (Name-tag lookup). Prepend
  `DEVICE_FARM_BASTION_IP=<ip>` to override it for a single run.

The run logs `Device Farm: routing localhost traffic via bastion <ip>` once it
resolves the IP, then prints a `visual log on device farm (codeorg-dev AWS
account)` link to the session in the AWS console.

---

## Verifying the plumbing

Check each hop in order; each step isolates one part of the path.

1. **Dashboard reachable locally.** With the server running:
   ```bash
   curl -sI -H 'Host: localhost-studio.code.org' http://localhost:3000/ | head -1
   ```
   Expect a `200`/`302`, not a connection refused.

2. **Tunnel is up and bound publicly.** With `bin/device_farm_tunnel` running,
   on the bastion confirm the listener is on `0.0.0.0:3000` (not `127.0.0.1`):
   ```bash
   ssh device-farm-bastion 'ss -tlnp | grep :3000'
   ```
   Expect `0.0.0.0:3000`. If it shows `127.0.0.1:3000`, `GatewayPorts` is not in
   effect (re-check step 4).

3. **Tunnel forwards to the dashboard.** From the bastion, dial its own
   forwarded port with the test hostname:
   ```bash
   ssh device-farm-bastion 'curl -sI -H "Host: localhost-studio.code.org" http://localhost:3000/ | head -1'
   ```
   Expect the same status as step 1. This proves the reverse tunnel relays to
   puma.

4. **End to end on Device Farm.** Run the command from "Running a test" with a
   tiny feature. Open the printed `visual log on device farm` link; the session
   recording should show the dashboard, not a connection-error page. A failure
   here with steps 1-3 passing points at the ENI->bastion hop: re-check the
   `df-bastion-sg` ingress on 3000 from `$ENI_SG` (step 2) and the project's VPC
   config (step 5).

---

## Cost and teardown

A `t4g.nano` left running is a few US dollars per month; stop it when idle
(`aws ec2 stop-instances --instance-ids <id>`). The private IP survives
stop/start, and the Name-tag lookup re-finds it even after a relaunch, so no
locals.yml edit is needed either way. Device Farm desktop sessions bill per
minute only while a test runs.

Full teardown:

```bash
aws ec2 terminate-instances --instance-ids <id>
aws devicefarm delete-test-grid-project --project-arn <arn>   # optional
aws ec2 delete-security-group --group-id "$BASTION_SG"
aws ec2 delete-security-group --group-id "$ENI_SG"
```

---

## Troubleshooting

- **`runner.rb` warns it can't look up the bastion by Name tag.** The active
  profile lacks `ec2:DescribeInstances`, or no running instance carries
  `Name=device-farm-bastion`. Check the `describe-instances` command in
  "Per-developer setup" returns an IP; or pin `device_farm_bastion_ip` to skip
  the lookup.
- **`connect.rb` warns the bastion IP is unset.** The lookup found nothing and
  no IP is pinned, so no `--host-resolver-rules` was added. Resolve the lookup
  above, or set `device_farm_bastion_ip`.
- **Chrome session shows ERR_CONNECTION_REFUSED / TIMED_OUT.** Work the
  verification steps above from 1 to 4; the first one that fails localizes the
  break.
- **`Host not permitted` / blocked host page.** The Host header reaching puma is
  not in `config.hosts`. The tunnel preserves the `localhost-studio.code.org`
  host, which is allowed; if you targeted a different hostname, add it there.
- **Tunnel exits immediately with "remote port forwarding failed".** A previous
  tunnel still holds `:3000` on the bastion. Kill it
  (`ssh device-farm-bastion 'pkill -f "sshd:.*3000"'`) or wait for it to drop.

## See also

- `features/support/connect.rb` -- where `--host-resolver-rules` is built.
- `bin/device_farm_tunnel` -- the reverse-tunnel helper.
- `README.md` (this directory) -- general UI test usage.
- `lib/cdo/aws/device_farm.rb` -- Device Farm session management.
