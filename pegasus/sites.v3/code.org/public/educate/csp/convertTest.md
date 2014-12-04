---
title: Computer Science Principles
nav: educate_nav
---
Code.org CSP Course

Unit 1 - Lesson synopses

Links: • [All Unit 1 Lesson Plans](https://drive.google.com/folderview?id=0B21d4g64Z62YS0FIdjhENWtIcDg&usp=sharing) •  [All Widgets](http://cspdashboard-c9-bfranke.c9.io/home.html)

<table>
  <tr>
    <th>Description</th>
    <th>Plan</th>
    <th>Widget</th>
  </tr>
  <tr>
    <td> **Lesson 01 - Impact of Innovation**
    Students are asked to consider the impact of technological innovation on their lives and multiple generations of their family.  e.g. "What technological innovation would your grandparent say affect them the most?"
</td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td>Lesson 02 - Sending Binary messages
Students are asked to consider messages that have binary states (which we call state ‘A’ and ‘B’ for the time being) and what can be communicated with a single bit.  Students use household materials to build a physical device to send a single binary message to a friend some number of feet away and out of their line of sight. 
</td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td>Lesson 03 - More complex messages
Students are asked to send more complex messages without changing their bit-sending device.  What can be represented with sequences of A/B state messages?  Develop a protocol for sending a message to a friend that has at least 4 possibilities.
</td>
    <td></td>
    <td></td>
  </tr>
</table>



**Lesson 04 - Bit Sending Widget**

Recognizing that since every bit-sending device made in the class sends binary messages, we lose the physical bit sending devices (they are cumbersome) and replace with an abstraction - the bit sending widget which simulates a simplex wire that can hold a state until the next state is set.  Students invent a call-response protocol and use the bit sending widget to send the bits - coordination, speed and timing become an issue.

**Widget**: [Sending Bits A/B](http://bit.ly/sendingBits_AB)

**Lesson 05 - Sending Bits in the Real World**

In groups, students research the various mediums over which bits are sent in the real world.  Focus on electricity, fiber optic, radio waves (WiFi, satellite), sound.  Connection: if we can find a way for a medium to reliably represent two states, we can use it to send any digital information.

**Lesson 06 - Number Systems**

Known as the "circle, triangle, square" activity, students effectively invent a base-3 number system but using circles, triangles and squares as the symbols instead of arabic numerals.  Objective is to understand that a you can represent any number, with any agreed-upon set of symbols that appear in an agreed-upon order.  Use this to connect to the binary number system and hex. **Widget**: [not made, but could] version of odometer with circle triangle square

**Lesson 7 - Binary numbers**

A little practice with binary numbers (finally using symbols "0" and “1”) and their properties (powers of 2, counting, etc.) since some facility is helpful.  Students make a “Binary flippy-do” to help practice.

**Widget**: [Odometer](http://cspdashboard-c9-bfranke.c9.io/Odometers/)s

**Lesson 08 - Sending numbers**

Students return to the sending bits widget - this version uses 0s and 1s, and also automatically sends/recvs bits at the bit-rate set by the user.  Student challenge is to invent a protocol for sending the cartesian coordinates for a line-drawing image that has at least 5 points.

**Widget**: [Sending bits - binary](http://bit.ly/sendingBits_binary) | [sending bits - numbers](http://bit.ly/sendingBits_numbers)

**Lesson 10 - Encoding Numbers in the Real World**

Another mini-research project about number systems used around the world.  This lesson might get deprecated, or combined with text in the real world lesson.

**Lesson 11 - Encoding Text**

Students invent their own binary encoding for the text in order to send a text message to a friend on the bit-sending widget.  Students create their own system, but are shown ASCII at the end of the lesson.

**Lesson 12 - Sending formatted Text**

Students must invent a way to, using only ASCII text, send formatted text (font size, color, position, etc.) to a friend.  Students effectively invent some version of HTML.

**Widget**: [Sending bits - numbers](http://bit.ly/sendingBits_numbers) | [Sending Bits - Text](http://bit.ly/sendingBits_text)

**Lesson 13 - Bytes and file sizes**

Students learning about Bytes (kilo, mega, giga, etc.) and are asked to look into the sizes of various files on their computer.  Connect to HTML - sending of formatted text.

**Lesson 14 - Text Compression**

Students consider how they might send more information in less time if they can’t improve the transmission rate - compression!  Students use a widget to effectively do a version of LZW compression by hand.  NOTE: is this is probably one of the most important lessons in the entire curriculum since it serves as an anchor for connecting threads about algorithms, efficiency, privacy, abstraction and procedural abstraction in programming.

**Widget**: [Text Compression Widget](http://bit.ly/csp_textCompression)

**Lesson 15 - Encoding and Compressing text in the real world**

Students do another mini-research project on how text representations and other compression schemes.  NOTE: This might be deprecated or moved to after image encoding since so many compression schemes are most immediately relevant for image file formats.

**Lesson 16 - Encoding B&W images**

Students invent a way to encode B&W images in binary.  Two important points come out: 1. the need for meta data in the information representation (width/height of the image) 2. That computer screens emit light and therefore "1" means turn the light on (white) and “0” means turn it off (black) -- This is important for standard color representations later.

**Widget**: [Pixelation B&W](http://cspdashboard-c9-bfranke.c9.io/Pixelation/Pixelation_v2.html)

**Lesson 17 - Encoding Color images**

Students learn about RGB (the physics) and have to choose how many bits will be needed to represent each pixel and how many colors are possible. Metadata conveying width, height, and now the number of bits used to represent each pixel must be included in the image encoding, along with the pixel data for the picture to be represented properly.  Knowing Hex becomes an asset here if you want many colors.

**Widget**: [Pixelation with Color and bits-per-pixel](http://cspdashboard-c9-bfranke.c9.io/Pixelation/Pixelation_v4.html)

**Lesson 18 - Mini Project - Personal Favicon assignment**

Students use the pixelation widget to encode the bits for 16x16 image that represents them somehow. 

**Widget**: [Pixelation with Color and bits-per-pixel](http://cspdashboard-c9-bfranke.c9.io/Pixelation/Pixelation_v4.html)

**Unit 1 Assessment - practice performance task -  Encode a complex piece of information.  **

Students must consider a complex type of information that has not been considered in class and invent a way to encode it in binary.  Students must present their file encoding protocol and respond to reflection prompts in writing.  

**Performance Task Writeup**: [Encode a Complex Piece of information](https://docs.google.com/a/code.org/document/d/1YnEyXcUz8N-goWSXMZRIhpZ2ogI29-YDY--RcO3erFc/edit)

