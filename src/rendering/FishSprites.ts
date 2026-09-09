const W = 24;

function row(s: string): string {
  return s.padEnd(W, '.');
}

export const FishSwimFrames: string[][] = [
  [
    row('..........##..........'),
    row('........##bbb#........'),
    row('.......#bbbbbb#.......'),
    row('......#lbbbbbbb#......'),
    row('...#T#llbbWEbbd#......'),
    row('..#TTT#bbbbbbbd#......'),
    row('...#TT#nbbbbbb#.......'),
    row('.....#ffbbbb#.........'),
    row('......#nnn#...........'),
  ],
  [
    row('...........#..........'),
    row('.........#bbb#........'),
    row('.......#bbbbbb#.......'),
    row('......#lbbbbbbb#......'),
    row('....#T#llbbWEbbd#.....'),
    row('...#TT#bbbbbbbd#......'),
    row('....#T#nbbbbbb#.......'),
    row('......#ffbbb#.........'),
    row('.......#nn#...........'),
  ],
  [
    row('..........##..........'),
    row('........##bbb#........'),
    row('.......#bbbbbb#.......'),
    row('......#lbbbbbbb#......'),
    row('.....#TllbbWEbbd#.....'),
    row('....#TT#bbbbbbd#......'),
    row('.....#T#nbbbbb#.......'),
    row('......#ffbbb#.........'),
    row('.......#n#............'),
  ],
  [
    row('...........#..........'),
    row('.........#bbb#........'),
    row('.......#bbbbbb#.......'),
    row('......#lbbbbbbb#......'),
    row('....#T#llbbWEbbd#.....'),
    row('...#TTT#bbbbbbd#......'),
    row('....#TT#nbbbbb#.......'),
    row('.....#ffbbbb#.........'),
    row('......#nn#............'),
  ],
];

export const FishIdleFrames: string[][] = [
  [
    row('..........##..........'),
    row('........##bbb#........'),
    row('.......#bbbbbb#.......'),
    row('......#lbbbbbbb#......'),
    row('...#T#llbbWEbbd#......'),
    row('..#TT#bbbbbbbbd#......'),
    row('...#T#nbbbbbbb#.......'),
    row('.....#ffbbb#..........'),
    row('......#nn#............'),
  ],
  [
    row('..........##..........'),
    row('........##bbb#........'),
    row('.......#bbbbbb#.......'),
    row('......#lbbbbbbb#......'),
    row('...#T#llbbWEbbd#......'),
    row('..#TT#bbbbbbbbd#......'),
    row('...#T#nbbbbbbb#.......'),
    row('......#ffbb#..........'),
    row('.......#n#............'),
  ],
];
