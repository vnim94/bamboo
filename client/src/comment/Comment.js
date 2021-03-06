import './Comment.css';
import Vote from '../vote/Vote';
import { useState } from 'react';
import { getTimeElapsed } from '../util/helpers';

function Comment(props) {

    const { id, post, date } = props.comment
    const { setComments, setFormType, toggleForm, user } = props;
    const [votes, setVotes] = useState(props.comment.votes);
    const [edit, setEdit] = useState(false);
    const [content, setContent] = useState(props.comment.content);

    const handleClick = () => {
        if (edit) {
            if (content !== props.comment.content) {
                updateComment();
            }
            setEdit(false);
        } else {
            setEdit(true);
        }
    }

    const handleChange = (event) => {
        setContent(event.target.value);
    }

    const updateComment = async () => {
        let api = `http://localhost:8000/api/posts/${post}/comments/${id}`;
        const token = localStorage.getItem('token');
        const updatedComment = { content: content };
        await fetch(api, {
            method: 'put',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedComment)
        })
    }

    const deleteComment = async () => {
        let api = `http://localhost:8000/api/posts/${post}/comments/${id}`;
        const token = localStorage.getItem('token');
        await fetch(api, {
            method: 'delete',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        api = `http://localhost:8000/api/posts/${post}/comments`;
        const response = await fetch(api, { mode: 'cors' });
        const comments = await response.json();
        setComments(comments);
    }
    
    return (
        <div className="bg-white comment-container flex flex-row flex-jc-c">
            <div className="user-avatar flex flex-jc-c">
                <img alt="" src="/panda.png" className="user-avatar-dp"></img>
            </div>
            <div className="comment-container">
                <div className="comment-header dark-grey flex flex-ai-c flex-jc-sb">
                    <div className="flex flex-ai-c">
                        <a href="/" className="user">{props.comment.user}</a>
                        {user && props.comment.user === 'You' &&
                        <>
                        <button className={`${edit ? 'on' : ''} modify-btn material-icons-outlined`} onClick={handleClick}>edit</button>
                        <button className="modify-btn material-icons-outlined" onClick={() => deleteComment()}>delete</button>
                        </>
                        }
                    </div>
                    <span>{getTimeElapsed(date, Date.now())}</span>
                </div>
                <div className="bg-white comment">
                    <div className={edit ? "comment-box" : ""}>
                        {edit ? <textarea name="content" className="medium-font text-area" value={content} onChange={handleChange} /> : <p>{content}</p>}
                    </div>
                    <div className="flex flex-ai-c">
                        <Vote id={id} user={user} votes={votes} setVotes={setVotes} setFormType={setFormType}
                toggleForm={toggleForm}/>
                        <button className="comment-btn">Reply</button>
                        <button className="comment-btn">Share</button>
                        <button className="comment-btn">Save</button>
                        <button className="comment-btn">Follow</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Comment;