const express = require('express');
const app = express();
const AWS = require('aws-sdk')
const bodyParser = require('body-parser')


app.use(express.static('./views'));
app.set('view engine', 'ejs');
app.set('views', './views')
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

const multer = require('multer');

const config = new AWS.Config({
    accessKeyId: 'AKIA2QLH2KVGISBBW373',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = 'BaiBao'

const upload = multer();

app.get('/', upload.fields([]), (req, res) => {
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            res.send('Internal Server Error');
        } else {
            return res.render('index', { sanPhams: data.Items });
        }
    });
});

app.post('/', upload.fields([]), (req, res) => {
    const { ma, tenBaiBao, tenTacGia, chiSoISBN, soTrang, namSX } = req.body;
    console.log(req.body)
    const params = {
        TableName: tableName,
        Item: {
            "ma": ma,
            "tenBaiBao": tenBaiBao,
            "tenTacGia": tenTacGia,
            "chiSoISBN": chiSoISBN,
            "soTrang": soTrang,
            "namSX": namSX
        }
    }

    docClient.put(params, (err, data) => {
        if (err) {
            return res.send(err);
        } else {
            return res.redirect("/");
        }
    })
});

app.post('/delete', upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);

    if (listItems.length == 0) {
        return res.redirect("/")
    }

    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                "ma": listItems[index]
            }
        }

        docClient.delete(params, (err, data) => {
            if (err) {
                return res.send('Internal Server Error');
            } else {
                if (index > 0) {
                    onDeleteItem(index - 1);
                } else {
                    return res.redirect("/");
                }
            }
        })
    }

    onDeleteItem(listItems.length - 1);
});

app.listen(3000, () => {
    console.log('Server is runing on port 3000')
});