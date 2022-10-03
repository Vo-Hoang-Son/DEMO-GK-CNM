const express = require('express');
const app = express();
const AWS = require('aws-sdk')
const bodyParser = require('body-parser')


app.use(express.static('./views'));
app.set('view engine', 'ejs');
app.set('views', './views')
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

//Multer là một middleware cho Express và Nodejs giúp dễ dàng xử lý dữ liệu multipart/form-data khi người dùng upload file.
const multer = require('multer');

//Cau hinh
const config = new AWS.Config({
    accessKeyId: 'AKIA2QLH2KVGISBBW373',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
});
AWS.config = config;

//Tạo một ứng dụng khách tài liệu DynamoDB với một tập hợp các tùy chọn cấu hình.
const docClient = new AWS.DynamoDB.DocumentClient();

// Ten bang
const tableName = 'BaiBao'


const upload = multer();

app.get('/', upload.fields([]), (req, res) => {
    const params = {
        TableName: tableName,
    };

    // Lấy danh sách các item từ table trong DynamoDB, rồi render danh sách đó lên trang index.ejs 
    docClient.scan(params, (err, data) => {
        if (err) {
            res.send('Internal Server Error');
        } else {
            return res.render('index', { sanPhams: data.Items });
        }
    });
});

app.post('/', upload.fields([]), (req, res) => {
    //lấy data từ người dùng nhập vào
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

    // Thêm index bên DynamoDB AWS
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

    // nếu danh sách item rỗng thì load lại trang
    if (listItems.length == 0) {
        return res.redirect("/")
    }

    /* Hàm xóa một item
    Tham số truyền vào: tên table, Id
    
    */
    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                "ma": listItems[index]
            }
        }

        /*
        Xóa item bên DynamoDB
        Nếu bị lỗi in ra màn hình "Internal Server Error"
        Nếu index > 0 thực thi hàm onDeleteItem(index)
        Nếu index = 0 trả về trang chủ
        */
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
// kết nối với cổng port 3000 
app.listen(3000, () => {
    console.log('Server is runing on port 3000')
});
