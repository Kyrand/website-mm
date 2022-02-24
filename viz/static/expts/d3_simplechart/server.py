#!flask/bin/python
from flask import Flask, make_response
import pandas as pd

app = Flask(__name__)

dummy_data = {
    0: pd.DataFrame({'name':['A', 'B', 'C', 'D'], 'value':[4, 2, 8, 5]}),
    1: pd.DataFrame({'name':['A', 'B', 'C'], 'value':[13, 29, 9]}),
    2: pd.DataFrame({'name':['A', 'B', 'C','D', 'E', 'F'], 'value':[3, 12, 9, 21, 15, 7]})
    }

@app.route('/')
def index():
    return make_response(open('index.html').read())


@app.route('/api/<int:id>')
def api(id):
    return make_response(dummy_data[id].to_json(orient='records'))


if __name__ == '__main__':
    app.run(debug = True, port = 8060)






        








        
    

