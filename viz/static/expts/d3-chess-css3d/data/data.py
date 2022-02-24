"""Usage:
  data.py (--sq | --mv) [-o OUTFILE] FILE
  data.py -h | --help | --version

Arguments:
FILE  input file

Options:
--sq  process square stats
--mv  process move stats
-o OUTFILE, --output=OUTFILE  output file[default: out.json]
"""

import pgn
from collections import Counter
import json

def process_games(games):
    from collections import defaultdict
    squares_hist = defaultdict(list)
    for g in games:
        process_game(g, squares_hist)
    print len(squares_hist)
    return squares_hist

    #sh = process_all_games(games)

def process_game(g, squares_hist=None):
    from collections import defaultdict
    if squares_hist == None:
        squares_hist = defaultdict(list)
    squares_occ = {}
    for i, move in enumerate(g.moves[:-1]):
        # of form Ra8a1
        if move[0].islower(): # pawn move or castle
            piece = i%2 and 'p'or'P'
            frm = move[0:2]
            to = move[2:4]
            # check for castling
            if frm == 'e1': # white king
                piece = 'K'
                if to == 'g1': # kings side
                    squares_occ['h1'] = False
                    squares_occ['f1'] = 'R'
                else:
                    squares_occ['a1'] = False
                    squares_occ['c1'] = 'R'
            if frm == 'e8': # black king
                piece = 'k'
                if to == 'g8': # kings side
                    squares_occ['h8'] = False
                    squares_occ['f8'] = 'r'
                else:
                    squares_occ['a8'] = False
                    squares_occ['c8'] = 'r'
        else:
            piece = i%2 and move[0].lower() or move[0].upper()
            frm = move[1:3]
            to = move[3:5]
        #print piece, to, frm
        # empty from, occupy to
        squares_occ[to] = piece
        squares_occ[frm] = False
        # update history dict
        for k, v in squares_occ.items():
            if v:
                squares_hist[k].append('%s_%d_%s'%(v, i, g.white[:4]))
    # print len(squares_hist)
    return squares_hist

def get_square_stats(sq, pfilt=False):
    l = [s.split('_')[0] for s in sq if not pfilt or s.split('_')[2] in pfilt]

    c = dict(Counter(l).most_common())
    c['total'] = sum(c.values())
    return c


def get_squares_data(games, fname):
    squares_hist = process_games(games)
    print len(squares_hist['e4'])
    data = []
    for pfilt in [['Kasp'], ['Karp'], False]:
        board_data = []
        for k, v in squares_hist.items():
            sq_data = {
                'square': k,
                }
            sq_data.update(get_square_stats(v, pfilt))
            board_data.append(sq_data)
        print 'Filter: %s, b0: %s'%(repr(pfilt), repr(board_data[0]))
        data.append({'name': pfilt or 'All', 'data':board_data})

    json.dump(data, open(fname, 'w'))
    return data


# def load_games_file(fname):
#     pgn.loads(open(fname).read())
if __name__ == '__main__':
    from docopt import docopt

    arguments = docopt(__doc__, version='0.1.1rc')
    print arguments
    fname = arguments.get('FILE')
    if fname:
        with open(fname) as f:
            games = pgn.loads(f.read())
            if arguments.get('--sq'):
                get_squares_data(games, arguments['--output'])
