---
title: Internet Simulator
description: Reference for the Internet Simulator — the network view, message encoding, routing, and connection status.
type: reference
---

The Internet Simulator is an interactive network simulation used in CS Principles. It connects students in the same class through a virtual network to demonstrate how data travels. Each lesson configures a different view of the simulator (bit-level encoding, packet routing, DNS, or encryption).

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/).

## Network view

The network view shows connected students as nodes. Lines between nodes represent links. The layout depends on the lesson's network topology: point-to-point, ring, mesh, or star.

## Message input and encoding

The input area lets you compose a message. Depending on the lesson configuration, you may type plain text, binary digits, or hexadecimal values. Some lessons require you to encode text into binary before sending; others display a protocol layer that wraps your message with headers.

## Sending and receiving

Select a recipient node in the network view, type the message, and select **Send**. The message travels through the network and appears in the recipient's received-messages area. In multi-hop topologies, the message may pass through intermediate nodes that you can observe in the network view.

## Connection status

Your name appears in the connected-users list when you load the level. If no classmates are connected, the list shows only you. Some lessons require at least one other student to be on the same level at the same time for the exercises to work.

## Bandwidth and protocol controls

Some lessons expose controls for setting the bandwidth (bits per second) of the simulated link, the packet size, or the addressing scheme. These controls affect how quickly messages arrive and how they are fragmented.

## Troubleshooting

### No other students appear

The Internet Simulator is class-scoped. All students must be in the same section and on the same level. Coordinate with your teacher to open the level at the same time.

### Messages arrive garbled

In encoding lessons, the simulator does not correct errors. If you encode incorrectly, the recipient sees exactly what was sent. Check your binary or hex encoding against the protocol the lesson describes.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Labs overview](/guide/labs/)
