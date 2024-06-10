const express = require('express')
const app = express()
const { ObjectId } = require('mongodb')

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const { MongoClient } = require('mongodb')

let db
const url = 'mongodb+srv://dnrjs322:Ugeon422@ugeon.arekvqo.mongodb.net/';
new MongoClient(url).connect().then((client) => {
  console.log('DB연결성공')
  db = client.db('Ugeon');
  app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
  })
}).catch((err) => {
  console.log(err)
})

app.get('/', async (요청, 응답) => {
  let result = await db.collection('post').find().toArray()
  응답.render('list.ejs', { 글목록: result })
})

app.get('/list', async (요청, 응답) => {
  let result = await db.collection('post').find().toArray()
  응답.render('list.ejs', { 글목록: result })
})

app.get('/write', (요청, 응답) => {
  응답.render('write.ejs')
})

app.post('/add', async (요청, 응답) => {
  try {
    if (요청.body.title == '') {
      // 클라이언트 측으로 알림을 보내기 위해 응답에 JSON 형식으로 메시지 전송
      응답.status(400).json({ message: '내용은 비워둘 수 없습니다.' });
    } else {
      await db.collection('post').insertOne({ title: 요청.body.title, content: 요청.body.content });
      응답.redirect('/list');
    }
  } catch (e) {
    console.log(e);
    응답.status(500).send('server error');
  }
});

app.get('/detail/:postId', async (요청, 응답) => {
  try {
    요청.params
    let result = await db.collection('post').findOne({ _id: new ObjectId(요청.params.postId) })
    if (result === null) {
      응답.status(404).send('not found')
    } else {
      응답.render('detail.ejs', { result: result })
    }
  } catch (e) {
    console.error(e)
    응답.status(404).send('not found or server error')
  }
})

app.get('/edit/:postId', async (요청, 응답) => {
  let result = await db.collection('post').findOne({ _id: new ObjectId(요청.params.postId) })
  응답.render('edit.ejs', { result: result })
})

app.post('/edit', async (요청, 응답) => {
  try {
    if (요청.body.title == '' || 요청.body.content == '') {
      응답.send('공백은 사용할 수 없습니다.')
    } else {
      await db.collection('post').updateOne({ _id: new ObjectId(요청.body.id) },
        {
          $set: { title: 요청.body.title, content: 요청.body.content }
        })
      응답.redirect('/list')
    }
  } catch (e) {
    console.log(e)
    응답.status(500).send('server error')
  }
})

app.delete('/delete', async (요청, 응답) => {
  let result = await db.collection('post').deleteOne({ _id: new ObjectId(요청.query.docid) })
  응답.send('삭제완료')
})