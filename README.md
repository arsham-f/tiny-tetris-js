Tiny Tetris
=====================

A very lightweight and minimal Tetris game written in JavaScript using HTML5 `canvas` rendering. The result of being bored on a friday night and feeling nostalgiac about my favourite game.

**Implementation**

There are four main shapes, each with its own base matrix. No shape can be wider or taller than four blocks, so matrices are limited to 4x4. Rotated shapes are simply transposed and mutated versions of their original matrix.

    // The "L" block
    [
		[0,0,0,0],
		[0,1,0,0],
		[0,1,0,0],
		[0,1,1,0]
	]


The game is currently configured to pull blocks down at 4Hz (4 blocks per second), with one block being defined as 25 square pixels.


[Demo](http://arsh.am/tetris)
---------------------