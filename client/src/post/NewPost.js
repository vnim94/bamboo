import env from 'react-dotenv';
import './NewPost.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NewPost(props) {

    const { setPosts, title, setTitle, user } = props;
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const token = localStorage.getItem('token');

    const handleChange = (event) => {
        switch (event.target.name) {
            case 'content':
                setContent(event.target.value);
                break;
            case 'title':
                setTitle(event.target.value);
                break;
            default:
        }       
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        let api = `${env.SERVER}/posts`;
        
        const post = {
            user: user._id,
            content: content,
            title: title 
        }

        const request = {
            method: 'post',
            headers: { 
                Accept: 'application/json',
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post)
        }

        const response = await fetch(api, request)

        if (response.status === 201) {
            setTitle('');

            let api = `${env.SERVER}/posts`;
        
            const response = await fetch(api, { mode: 'cors' });
            const data = await response.json();
            setPosts(data);

            navigate('/');
        }

    }

    return (
        <div className="flex flex-jc-c">
            <div className="bg-white new-post">
                <form onSubmit={handleSubmit}>
                    <input className="field title" name="title" placeholder="Title" type="text" required={true} value={title} onChange={handleChange} />
                    <textarea name="content" className="medium-font post-area" placeholder="Create your post" value={content} onChange={handleChange} />
                    <button className="bg-dark-green white btn submit-btn" type="submit" disabled={content.length === 0 || title.length === 0}>Post</button>
                </form>
            </div>
        </div>
    )
}

export default NewPost;