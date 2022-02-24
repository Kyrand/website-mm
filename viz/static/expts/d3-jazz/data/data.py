"""Usage:
  data.py [-o OUTFILE]
  data.py -h | --help | --version

Options:
-o OUTFILE, --output=OUTFILE  output file[default: out.json]
"""
 
import traceback


def clean_song(song):
    song['metadata']['COM'] = song['metadata']['COM'].strip()
    return song

def get_jazz_files():
    from glob import glob
    from humpy import jazzscore
    songfnames = glob('iRb_v1-0/*.jazz')
    songs = []
    for fname in songfnames:
        try:
            songs.append(clean_song(jazzscore.JazzScore(fname).song))
        except:
            print 'oops - ' + str(fname)
            traceback.print_exc()
    return songs


if __name__ == '__main__':
    from docopt import docopt
    arguments = docopt(__doc__, version='0.1.1rc')
    songs = get_jazz_files()
    import json
    json.dump(songs, open(arguments['--output'], 'w'))
    
