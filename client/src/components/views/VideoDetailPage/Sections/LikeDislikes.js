import React, { useEffect, useState } from 'react'
import { Tooltip, Icon } from 'antd';
import Axios from 'axios';

function LikeDislikes(props) {

    const [Likes, setLikes] = useState(0)
    const [LikeAction, setLikeAction] = useState(null)

    const [Dislikes, setDislikes] = useState(0)
    const [DislikeAction, setDislikeAction] = useState(null)

    let variable = {}

    if(props.video){
        variable = { videoId: props.videoId, userId: props.userId}
    }else {
        variable = { commentId: props.commentId, userId: props.userId}
    }

    useEffect(() => {
        Axios.post('/api/like/getLikes', variable )
        .then(response => {
            if(response.data.success) {

                // 얼마나 많은 좋아요를 받았는지
                setLikes(response.data.likes.length)

                // 내가 이미 그 좋아요를 눌렀는지
                response.data.likes.map(like => {
                    if(like.userId === props.userId) {
                        setLikeAction('liked')
                    }
                })
                
            } else {
                alert('Likes에 정보 가져오기 실패!')
            }
        })



        Axios.post('/api/like/getDislikes', variable )
        .then(response => {
            if(response.data.success) {

                // 얼마나 많은 싫어요를 받았는지
                setDislikes(response.data.dislikes.length)

                // 내가 이미 그 싫어요를 눌렀는지
                response.data.dislikes.map(dislike => {
                    if(dislike.userId === props.userId) {
                        setDislikeAction('disliked')
                    }
                })
                
            } else {
                alert('Dislikes에 정보 가져오기 실패!')
            }
        })
    }, [])


    return (
        <div>
            <span key="comment-basic-like">
                <Tooltip title="like">
                    <Icon type="like"
                          theme={LikeAction === 'liked'? 'filled' : 'outlined'}
                          onClick
                    />
                </Tooltip>
                <span style={{ paddingLeft: '5px', paddingRight: '15px', cursor: 'auto'}}> {Likes} </span>
            </span>
            <span key="comment-basic-dislike">
                <Tooltip title="Dislike">
                    <Icon type="dislike"
                          theme={DislikeAction === 'disliked'? 'filled' : 'outlined'}
                          onClick
                    />
                </Tooltip>
                <span style={{ paddingLeft: '5px', paddingRight: '15px', cursor: 'auto'}}> {Dislikes} </span>
            </span>
        </div>
    )
}

export default LikeDislikes