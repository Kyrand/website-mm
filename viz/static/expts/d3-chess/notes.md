### Processing pgns with Python

    import pgn
    games = pgn.loads(open('data/kasparov_karpov.pgn').read())
    len(games)
    games[0]
    game = games[0]
    game.moves

### Crude testing

    cb.update({from: 'g7', to: 'g5'})
    // en passant
    cb.update({from: 'h5', to: 'g6', flags: 'e', color:'w'})
    // promotion
    cb.update({from: 'h8', to: 'h8', flags: 'p', promotion:'n'})

### Data munging
    def get_move_counts():
        import pgn 
        from collections import Counter
        from itertools import izip_longest
        games = pgn.loads(open('kasparov_karpov.pgn').read())
        all_moves = [g.moves for g in games]

        #zipped_moves = zip(*list(izip_longest(*all_moves)))
        zipped_moves = list(izip_longest(*all_moves))
        print zipped_moves[:2]
        move_counts = [Counter(moves).most_common() for moves in zipped_moves]
        return move_counts
