import express from 'express';
//import path from 'path';
import nunjucks from 'nunjucks';
import bodyParser from 'body-parser';
//import fs from 'fs';
import mongoose from 'mongoose';

//const __dirname = path.resolve();
const app = express();

//file path set
//myapp\data\writing.json과 같은 경로를 가리키게 됨
//const filepath = path.join(__dirname, 'data', 'writing.json');

//body parser set
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//view engine set
app.set('view engine', 'html'); //main.html -> main(.html)

//nunjucks
nunjucks.configure('views', {
    watch: true, //html파일이 수정될 경우 다시반영 후 렌더링
    express: app
});             


//mongoose connect
mongoose
    .connect('mongodb://localhost:27017/test')
    .then(() => { console.log('MongoDB connected...')})
    .catch(e => console.log(e));

//mongoose set
const { Schema } = mongoose;

const WritingSchema = new Schema({
    title: String,
    contents: String,
    date: {
        type: Date,
        default: Date.now,
    }
})

const Writing = mongoose.model('Writing', WritingSchema);


//middleware
//main page GET요청
app.get('/', async(req, res) => {
    //const fileData = fs.readFileSync(filepath);//파일 읽기
    //const writings = JSON.parse(fileData); //파일 변환

    let writings = await Writing.find({}).sort({ date: -1 })//동기 처리 // find안에 아무값도 없으면 writing으로 된 모든 객체 찾음
    // 최신글은 상단에 오도록 정렬

    //console.log(writings);
    res.render('main', { list: writings });
});


//write get 요청
app.get('/write', (req, res) => {
    res.render('write');
});

//write post 요청
app.post('/write', async(req, res) => {
    const title = req.body.title;
    const contents = req.body.contents;
    // const date = req.body.date;

    //mongodb에 저장
    const writing = new Writing({
        title: title,
        contents: contents
    })
    const result = await writing.save().then(()=> {
        console.log('Writing success');
        res.redirect('/');// 저장 후 메인페이지로 이동
     }).catch((err) => {
        console.error(err)
        res.render('write')
     })

});



//edit get 요청
app.get('/edit/:id', async (req, res) => {
    const id = req.params.id;

    const edit = await Writing.findOne({ _id: id }).then((result) => {
        res.render('detail', { 'edit': result })
    }).catch((err) => {
        console.error(err)
    })
})
    
//edit post 요청
app.post('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const contents = req.body.contents;

    const edit = await Writing.replaceOne({ _id: id }, { title: title, contents: contents }).then((result) => {
        console.log('update success')
        res.render('detail', { 'detail': { 'id': id, 'title': title, 'contents': contents } });
    }).catch((err) => {
        console.error(err)
    })
})


//delete get 요청
app.get('/detail/:id', async (req, res) => {
    const id = req.params.id;
     //id 값 받아오기
    const detail = await Writing.findOne({ _id: id }).then((result)=>{
        res.render('detail', { 'detail': result });
    }).catch((err) => {
        console.error(err)
    })
    //res.render('detail');
})

//delete post 요청
app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
        
    const delete_content = await Writing.deleteOne({ _id: id }).then(() => {
        console.log('delete success')
        res.redirect('/') //삭제 후 메인페이지로 이동
    }).catch((err) => {
        console.error(err) //에러 발생시 에러메세지 출력
    })
})

app.listen(3080,()=>{
    console.log('Server is running on port 3080a');
});

//블로그 화면구성 메인페이지 네비게이션바 풋터
//블로그 CRUD 글작성,목록,상세페이지,수정,삭제
//nodemon 설치 npm install nodemon -D

//템플릿 엔진 ejs nunjucks

// 글작성
// 글 목록 main page 페이지 접속, GET요청 /
// 글 작성 write page 접속 GET 작성 POST /write
// 글 상세 페이지 detail page 접속 GET /detail
// 글 수정 페이지 edit page 접속 GET 수정 POST /edit 

//버퍼 데이터 <Buffer 5b 5d>를 얻음 