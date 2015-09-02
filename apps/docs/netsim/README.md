# Internet Simulator

The Internet Simulator is a multi-user computer network simulation,
designed as a supplementary tool for teaching networking and data encoding
concepts.

This document is a technical overview of the simulator.
For developer set-up instructions see [CONTRIBUTING.md](./CONTRIBUTING.md).

* [Overview](#overview)
* [Shared Storage](#shared-storage)
  * [Shards](#shards)
  * [Tables](#tables)
* [Distribution of Responsibility](#distribution-of-responsibility)
  * [Router Status](#router-status)
  * [Router Connection Limits](#router-connection-limits)
  * [Address Assignment](#address-assignment)
  * [Message Routing](#message-routing)

## Overview

The Internet Simulator simulates a computer network for a group of users.
It does not actually establish peer-to-peer connections between clients;
instead, each client communicates with the [Internet Simulator
API](../../../shared/middleware/net_sim_api.rb) on Code.org's servers, so all
clients interact with a common network state hosted with us. Beyond that
network state, there is little intelligence on the server - clients are
trusted, and distribute work for running the simulation among themselves
according to some simple rules.

## Shared Storage

The simulator keeps common network state in a [Redis](http://redis.io/)
key-value store. The simulation data is organized into "shards" and "tables."

### Shards

Each client connects to a NetSim **Shard** ([in the MMORPG
sense](https://en.wiktionary.org/wiki/shard)), which is a complete network
state that is private to a subset of users. In practice each shard is a single
key-hash pair in Redis, where the key is the shard ID and the hash contains a
set of tables.

Normally, selecting a shard is completely hidden from the user. For students
who are logged in and working with their class section, the shard ID will be
generated so that they join the same shard as their classmates.
Some users may belong to/own more than one section (e.g. Teachers). They will
be able to select a shard to join upon opening the app.

> Tentatively, users without an account can create a private shard that uses a
> UUID for its section ID. They can then copy a shard link that allows other
> users to join their shard. We may disable this feature in the future, as
> a privacy concern.

Every shard has an expiration time. After two hours of inactivity (no write
operations by any client on the shard) all data associated with the shard will
be deleted. Teachers and admins also have the ability to manually reset a shard.

### Tables

Each shard contains a set of tables. All of the state for the shard is stored
in these tables. Rows in shared storage tables don't have 'columns' so much as
'members,' because they are JSON blobs. In addition, every row has an ID,
which NetSim relies on as an identifier for that network entity.

Every shard has four tables: Nodes, wires, messages and logs.

---

**Nodes** represent devices in the network.. They exist in this table,
primarily so that they can receive a row ID, which becomes their unique
identifier within the shard, and to broadcast their presence on the shard to
other clients.

As soon as a student joins a shard, they create a user node row on that shard.
When they disconnect, their user node row is deleted.

User node rows are only modified by the client that created the row.
Router rows can be modified by any client, and present one of the
synchronization challenges in the system.

| member | purpose | example |
| ------ | ------- | ------- |
| name   | Display name of node, for display to other clients in lobby. Used to generate hostname too. | name:"Brad" |
| type   | Either "user" or "router" for now. | type:"user" |

---

**Wires** model physical connections between nodes, and metadata about those
connections. The wires table ends up acting as an address table for routers,
and a source for visualizing the network graph.

When a student selects a router and clicks "Connect," they are creating a wire
from their node to the router node. When detecting a new wire, a router will
assign an address on that wire that is unique within the router's local
network. When a node disconnects from another node, the wire connecting
them is deleted.

Wire rows are only modified by the client that created them (with the
exception of the cleanup system - see "Shard Cleaning" below). Address
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
exist between any two nodes. This effectively becomes "on-wire" storage.

Notably missing from this table is an "address" field. Routing data must be
included in the payload. A routed message is actually two message rows - one
from the sender node to the router node, then another from the router node to
the recipient.

Message rows are only created by the sender, and only deleted by the recipient.
They are never modified. In the case of messages sent to a router, the sender
acts as the router and consumes the original message, then produces the new
message from the router to the recipient.

| member | purpose | example |
| ------ | ------- | ------- |
| fromNodeID | Row ID of source node in Nodes table. | fromNodeID:44 |
| toNodeID | Row ID of destination node in the Nodes table. | toNodeID:46 |
| simulatedBy | Row ID of the user node responsible for picking up this message. | simulatedBy:44 |
| base64Payload | Actual information being sent between nodes; a packet. Base-64 encoded to minimize request size. | payload:"kg==" |
| extraHopsRemaining | When using inter-router messaging, how many extra hops should be artificially introduced for this packet. Decrements as the packet moves around the network. | extraHopsRemining:2 |
| visitedNodeIDs | Array of routers IDs (row IDs in the Nodes table) that have touched this packet. Used to avoid backtracking. | visitedNodeIDs:[] |

---

**Log Entries** are entries in a shard log for a node on the network.
Right now only router nodes have logs, and they are kept in remote storage
so that all clients see a consistent view of the router logs.

Log entries are created by the client that is acting as the router for the
particular operation that generates the log. They are never modified or removed.
Because of this guarantee clients interact with the log table differently from
the other tables, requesting simple forward deltas to keep requests small.

| member | purpose | example |
| ------ | ------- | ------- |
| nodeID | Row ID of router node in Nodes table. | nodeID:44 |
| base64Binary | Complete packet associated with log event. | base64Binary:"kg==" |
| status | A 'routing status' for the entry, indicating SUCCESS or DROPPED. | status:'success' |
| timestamp | Seconds since the epoch, UTC. | timestamp:1441052847 |

---

## Distribution of Responsibility

Because there is little server logic beyond the storage table mechanism, clients
must divide up the simulation work so that they don't conflict with one another.
For simulating the local client node this is fairly simple; for shared entities
like routers and wires it's more difficult. Here are some of the ways that the
simulation resolves conflicts.

### Router Status

For now, routers can be created by anybody, and updated by anybody. So far this
hasn't been a significant problem, because the only thing to update has been the
router's visible status, and it's not a huge issue if that's out of date for a
few seconds.

### Router Connection Limits

Routers are allowed a maximum of six connections in our simulation, so what
happens if two clients try to connect to a router at the same time?  Here's
the protocol each client follows.

1. The client optimistically creates a wire connecting it to the router.
2. The router (actually the client on the router's behalf), detecting a new
   connection, is given an opportunity to accept or reject the connection. It
   queries the wires table, and if it finds that it's beyond its connection
   limit, it rejects the connection.
3. If the connection is rejected, the client destroys the wire and reports a
   connection failure.

In this way, if two clients simultaneously attempt to fill the router's last
seat they will both fail to connect and have to try again.

### Address assignment

Similar to the connection limit, it's possible that two clients will
simultaneously try and get a unique local address from the router. Since both
clients are acting as the router on their own behalf, they might both get
assigned the same address. This is not solved yet. Probably will implement a
similar optimistic-assignment and rollback strategy.

### Message Routing

The actual work of the router, directing a message to its destination, is
always handled by the sending client. In a network with multiple routers,
the sending client would act as each router for messages that it originated.
The recipient only needs to simulate their local node for the final step of
receiving the message.

| Step | Work done by sender | Work done by recipient |
| ---- | ------------------- | ---------------------- |
| 1.   | Creates message A from self to router in message table. | |
| 2.   | (As router) Detects message A on wire (immediately via local callback). Copies payload to local storage and deletes message A from the message table. | |
| 3.   | (As router) Examines payload for an address, and does a lookup against wires table for a destination node. | |
| 4.   | (As router) Creates message B from router to recipient in message table (with original payload). | |
| 5.   | | Detects message B on wire (via polling, soon to be replaced with remote notifications). Copies payload to local storage and deletes message B from the message table. |
