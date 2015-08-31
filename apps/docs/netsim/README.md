# Internet Simulator

The Internet Simulator is an app running on studio.code.org that simulates a
network for a group of users.  It does not actually establish peer-to-peer
connections between clients; instead, each client communicates with the
standard [app storage API](../../docs/client-api.md) on Code.org's servers, so
all clients interact with a common network state hosted with us.  Beyond that
network state, there isn't any intelligence on the server - clients are
trusted, and distribute work for running the simulation among themselves
according to some simple rules.

* [Shared Storage](#shared-storage)
  * [Shards](#shards)
  * [Tables](#tables)
* [Distribution of Responsibility](#distribution-of-responsibility)
  * [Router Status](#router-status)
  * [Router Connection Limits](#router-connection-limits)
  * [Address Assignment](#address-assignment)
  * [Message Routing](#message-routing)
  * [Shard Cleaning](#shard-cleaning)

## Developer set-up

There are two special dependencies beyond normal Code.org developer set-up:
Redis and Pusher. See full instructions in [CONTRIBUTING.md](./CONTRIBUTING.md).

## Shared Storage

The network simulator has its own app ID within the app storage system, and
creates/interacts with shared tables to model a common network state.

### Shards

Each client connects to a NetSim **Shard**, which is just a complete network
state that is private to a subset of users.  In practice this is a set of
tables that contain the same shard ID in their tablenames.  For students
logged in and working with their class section, the shard ID will be generated
so that they join the same shard as their classmates.  Normally, selecting a
shard is completely hidden from the user.  Some users may belong to/own more
than one section (e.g. Teachers).  They will be able to select a shard to
join upon opening the app.

> Tentatively, users without an account can create a private shard that uses a
> UUID for its section ID. They can then copy a shard link that allows other
> users to join their shard.  We may disable this feature before release, as
> a privacy concern.

### Tables

Each shard contains a set of tables.  All of the state for the shard is stored
in these tables. Rows in shared storage tables don't have 'columns' so much as
'members,' because they are JSON blobs.  In addition, every row has an ID,
which NetSim relies on as an identifier for that network entity.

---

**Nodes** represent devices in the network.  They exist in this table,
primarily so that they can receive a row ID, which becomes their unique
identifier within the shard, and to broadcast their presence on the shard to
other clients.

As soon as a student joins a shard, they create a user node row on that shard.
When they disconnect, their user node row is deleted.

User node rows are only modified by the client that created the row (with the
exception of the cleanup system - see "Shard Cleaning" below).  Router rows
can be modified by any client, and present one of the synchronization
challenges in the system.

| member | purpose | example |
| ------ | ------- | ------- |
| name   | Display name of node, for display to other clients in lobby.  Used to generate hostname too. | name:"Brad" |
| type   | Either "user" or "router" for now. | type:"user" |

---

**Wires** model physical connections between nodes, and metadata about those
connections.  The wires table ends up acting as an address table for routers,
and a source for visualizing the network graph.

When a student selects a router and clicks "Connect," they are creating a wire
from their node to the router node.  When detecting a new wire, a router will
assign an address on that wire that is unique within the router's local
network.  When a node disconnects from another node, the wire connecting
them is deleted.

Wire rows are only modified by the client that created them (with the
exception of the cleanup system - see "Shard Cleaning" below).  Address
assignment is done by the appropriate client simulating the router for
that purpose.

| member | purpose | example |
| ------ | ------- | ------- |
| localNodeID | Row ID of local node in Nodes table. | localNodeID:44 |
| remoteNodeID | Row ID of remote node in Nodes table. | remoteNodeID:46 |
| localAddress | Assigned address of local node within router network. | localAddress:1 |
| remoteAddress | Assigned address of remote node within router network (for now, always 0, the router). | remoteAddress:0 |
| localHostname | Hostname of local node. | localHostname:"brad" |
| remoteHostname | Hostname of remote node. | remoteHostname:"router46" |

---

**Messages** represent data in-flight between nodes, sent but not yet received.
Rather than actually modify a wire row or even refer to one, messages simply
exist between any two nodes.  This effectively becomes "on-wire" storage.

Notably missing from this table is an "address" field.  Routing data must be
included in the payload.  A routed message is actually two message rows - one
from the sender node to the router node, then another from the router node to
the recipient.

Message rows are only created by the sender, and only deleted by the recipient.
They are never modified.  In the case of messages sent to a router, the sender
acts as the router and consumes the original message, then produces the new
message from the router to the recipient.

| member | purpose | example |
| ------ | ------- | ------- |
| fromNodeID | Row ID of source node in Nodes table. | fromNodeID:44 |
| toNodeID | Row ID of destination node in the Nodes table. | toNodeID:46 |
| simulatedBy | Row ID of the user node responsible for picking up this message. | simulatedBy:44 |
| payload | Actual information being sent between nodes; a packet.  Eventually, base-64-encoded binary. | payload:"00010010" |
| extraHopsRemaining | When using inter-router messaging, how many extra hops should be artificially introduced for this packet.  Decrements as the packet moves around the network. | extraHopsRemining:2 |
| visitedNodeIDs | Array of routers IDs (row IDs in the Nodes table) that have touched this packet.  Used to avoid backtracking. | visitedNodeIDs:[] |

---

**Heartbeats** are simple presence indicators for a node, used to broadcast to
the whole shard that your client is still online.

These used to be on the node rows themselves, until I realized that this would
cause undesirable change notifications to propagate through the system
constantly.  Now this table is used by the cleanup system to determine whether
a node needs cleaning up.

Client node heartbeats are created and updated by the browser that owns the
client.  Router node heartbeats and created by client nodes using the router,
so an unused router will expire.  The cleanup system deletes heartbeats.

| member | purpose | example |
| ------ | ------- | ------- |
| nodeID | Row ID of active node in Nodes table. | nodeID:44 |
| time   | Client timestamp of last modification, used to expire nodes. | time:1423611185 |

---

## Distribution of Responsibility

Because there is no server logic beyond the storage table mechanism, clients
must divide up the simulation work so that they don't conflict with one another.
For simulating the local client node this is fairly simple; for shared entities
like routers and wires it's more difficult.  Here are some of the ways that the
simulation resolves conflicts.

### Router Status

For now, routers can be created by anybody, and updated by anybody.  So far this
hasn't been a significant problem, because the only thing to update has been the
router's visible status, and it's not a huge issue if that's out of date for a
few seconds.

### Router Connection Limits

Routers are allowed a maximum of six connections in our simulation, so what
happens if two clients try to connect to a router at the same time?  Here's
the protocol each client follows.

1. The client optimistically creates a wire connecting it to the router.
2. The router (actually the client on the router's behalf), detecting a new
   connection, is given an opportunity to accept or reject the connection.  It
   queries the wires table, and if it finds that it's beyond its connection
   limit, it rejects the connection.
3. If the connection is rejected, the client destroys the wire and reports a
   connection failure.

In this way, if two clients simultaneously attempt to fill the router's last
seat they will both fail to connect and have to try again.

### Address assignment

Similar to the connection limit, it's possible that two clients will
simultaneously try and get a unique local address from the router.  Since both
clients are acting as the router on their own behalf, they might both get
assigned the same address.  This is not solved yet.  Probably will implement a
similar optimistic-assignment and rollback strategy.

### Message Routing

The actual work of the router, directing a message to its destination, is
always handled by the sending client.  In a network with multiple routers,
the sending client would act as each router for messages that it originated.  
The recipient only needs to simulate their local node for the final step of
receiving the message.

| Step | Work done by sender | Work done by recipient |
| ---- | ------------------- | ---------------------- |
| 1.   | Creates message A from self to router in message table. | |
| 2.   | (As router) Detects message A on wire (immediately via local callback).  Copies payload to local storage and deletes message A from the message table. | |
| 3.   | (As router) Examines payload for an address, and does a lookup against wires table for a destination node. | |
| 4.   | (As router) Creates message B from router to recipient in message table (with original payload). | |
| 5.   | | Detects message B on wire (via polling, soon to be replaced with remote notifications).  Copies payload to local storage and deletes message B from the message table. |

### Shard Cleaning

Sometimes, clients are disconnected without warning, leaving orphaned rows in
shared storage.  Since the server doesn't have any special logic to handle this
case, clients take turns performing cleanup on the various shard tables themselves.

1. Each client periodically triggers a cleanup subsystem.
2. When it starts up, the cleanup subsystem should attempt to get a 'cleaning
   lock' on the network, similar to how routers enforce connection limits.  
   Expired cleaning locks can be overwritten.
3. When a client successfully gets a cleaning lock, it begins checking for
   invalid rows in the shard tables, such that the cleanup cascades from one
   table to the next.
  1. First, any heartbeats over a certain age may be deleted.
  2. The nodes table gets cleaned first.  Any node that hasn't had an entry in
     the heartbeat table in (TIMEOUT) milliseconds can be removed.
  3. The wires table comes next.  Any wire with an end connected to a missing
     node is invalid and may be cleaned up.
  4. The messages table is next. Any message going to a missing node may be
     cleaned up.
4. When it's done, the client releases the cleaning lock, letting another
   client take a turn.
