import './Post.css';
import PostHeader from './PostHeader';
import Comment from '../comment/Comment';

function Post() {
    return (
        <div className="post-container flex flex-col flex-ai-c">
            <PostHeader />
            <div className="post-container flex flex-col flex-ai-c">
                <div className="bg-white post flex">
                    <div className="post-votes flex flex-col flex-ai-c">
                        <button className="vote-btn material-icons-outlined">thumb_up</button>
                        12
                        <button className="vote-btn material-icons-outlined">thumb_down</button>
                    </div>
                    <div className="post-content flex flex-col flex-jc-sb">
                        <div className="post-details">
                            <div className="dark-grey flex flex-jc-sb">
                                <span>Posted by <a className="author" href="/">Author</a></span>
                                <span>8 hours ago</span>
                            </div>
                            <h3>Title</h3>
                            <p>This is a post</p>
                        </div>
                        <div className="post-btns flex flex-row">
                            <a className="flex flex-row flex-ai-c" href="/">
                                <span>Comment</span>
                                <span className="material-icons-outlined">comment</span>
                            </a>
                            <a className="flex flex-row flex-ai-c" href="/">
                                <span>Share</span>
                                <span className="material-icons-outlined">share</span>
                            </a>
                            <a className="flex flex-row flex-ai-c" href="/">
                                <span>Save</span>
                                <span className="material-icons-outlined">bookmark_border</span>
                            </a>
                        </div>
                        <hr className="line"></hr>
                    </div>
                </div>
            </div>
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Comment />
        </div>
        
    )
}

export default Post;