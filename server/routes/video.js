const express = require('express');
const router = express.Router();
const multer = require('multer');
var ffmpeg = require('fluent-ffmpeg');

const { Video } = require("../models/Video");
/* const { Subscriber } = require("../models/Subscriber");
const { auth } = require("../middleware/auth"); */

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.mp4') {
            return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
        }
        cb(null, true)
    }
})

var upload = multer({ storage: storage }).single("file")
//=================================
//             User
//=================================

router.post("/uploadfiles", (req, res) => {
    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err })
        }
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
    })
});


router.post("/thumbnail", (req, res) => {
    // 썸네일 생성 및 비디오 러닝타임 가져오기


    let filePath ="";
    let fileDuration ="";
    
    // 비디오 정보 가져오기
    ffmpeg.ffprobe(req.body.url, function(err, metadata){
        console.dir(metadata);
        console.log(metadata.format.duration);

        fileDuration = metadata.format.duration;
    })

    // 썸네일 생성
    ffmpeg(req.body.url)
        .on('filenames', function (filenames) {
            console.log('Will generate ' + filenames.join(', '))
            filePath = "uploads/thumbnails/" + filenames[0];
        })
        .on('end', function () {
            console.log('Screenshots taken');
            return res.json({ success: true, url: filePath, fileDuration: fileDuration})
        })
        .screenshots({
            // Will take screens at 20%, 40%, 60% and 80% of the video
            count: 3,
            folder: 'uploads/thumbnails',
            size:'320x240',
            // %b input basename ( filename w/o extension )
            filename:'thumbnail-%b.png'
        });

});


router.post("/uploadVideo", (req, res) => {
    // 비디오 정보들을 저장한다.
    const video = new Video(req.body);
    video.save((err, doc)=>{
        if(err) return res.json({ success: false, err})
        res.status(200).json({ success: true })
    })
    
});


router.get("/getVideos", (req, res) => {
    // 비디오를 DB에서 가져와 클라이언트에 보낸다.
    // populate를 해줘야 writer의 모든 정보 가져올 수 있음. 아니면 아이디만 가져오게 됨.

    Video.find()
        .populate('writer')
        .exec(( err, videos) => {
            if(err) return res.status(400).send(err);
            res.status(200).json({ success: true, videos })
        })
    
});



router.post("/getVideoDetail", (req, res) => {
    // 비디오 상세 조회
    Video.findOne({ "_id" : req.body.videoId })
    .populate('writer')
    .exec(( err, videoDetail ) => {
        if(err) return res.status(400).send(err);
        res.status(200).json({ success: true, videoDetail })
    })
});


module.exports = router;