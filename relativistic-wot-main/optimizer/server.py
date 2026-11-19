from flask import Flask
from flask import request
import learning as l

app = Flask(__name__)


@app.route('/', methods=['POST'])
def hello():
    data = request.json['csv']
    print('data:')
    try: 
        learning = l.Learning()
        learning.resetGlobal()
        learning.isDrone = False
        res = learning.main([data])
        return res
    except:
        # learning.resetGlobal()
        raise Exception("Sorry, an error occurred") 