# Random Knot Generator
This program generates knot diagrams somewhat randomly. The goal isn't to make totally random knots, but to instead have a neat visual tool to view, test, and analyze a bunch of knots. It's active and running at https://beanway.me/projects/knottheory/knotgenerator.

## How it works
It's a naive approach which forms generations of paths. If a generation forms a 2x2 pixel block, for example, that generation is killed and a new path is tried again from its parent. If two many of the parent's children fail, then the parent is killed and the grandparent tries again. This process happens until the path closes (it reaches the starting point) which it tries to do after a certain number of generations. The crossings are then added by alternating (over-under) by their (y, x) order (top-to-bottom, left-to-right).

## Issues
It's very prone to creating trivial knots. One way around this is to alternate crossings as the knot moves along its path instead of by (y, x) order.
