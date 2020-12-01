import React from 'react';

import { CommentsService } from 'src/services';
import { CommentsContext, UserContext } from 'src/context';
import useFormState from 'src/hooks/useFormState';
import './commentsPage.scss';

const CommentsPage = ({ match, history }) => {
  const [header, setHeader] = React.useState('');
  const [, setError] = React.useState(null);

  const { userData } = React.useContext(UserContext);
  const {
    bugComments,
    getCommentsByBug,
    addNewComment,
  } = React.useContext(CommentsContext);

  const { formFields, handleOnChange } = useFormState({
    bug_id: match.params.bugId,
    comment: '',
  });

  const [commentsLoaded, setLoaded] = React.useState(false);

  if (commentsLoaded === false) {
    let commentData = getCommentsByBug(match.params.bugId);
    setLoaded(true);
    if (bugComments[0]) {
      setHeader(bugComments[0].bugName);
    }
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    formFields.user_name = userData.userName;
    const res = await CommentsService.postNewComment(formFields);

    if (res.error) {
      console.error(res);
      setError(res.error);
      return;
    }

    await addNewComment(res.newComment);
    setLoaded(false);
    formFields.comment = '';
  };

  const openEdit = () => {
    if (userData.dev === true) {
      return (
        <div className="edit-button-holder">
          <button
            className="edit-button"
            onClick={() => {
              history.push(`/dashboard/edit/${match.params.bugId}`);
            }}
          >
            Edit bug
          </button>
        </div>
      );
    }
  };

  // React.useEffect(() => {
  //   const fetchComments = async () => {
  //     await getCommentsByBug(match.params.bugId);
  //   };

  //   if (bugComments && !header) {
  //     if (bugComments[0].message) {
  //       setError(bugComments[0].message);
  //     } else setHeader(bugComments[0].bugName);
  //   }

  //   if (!bugComments) {
  //     fetchComments();
  //   }
  // }, [getCommentsByBug, match.params.bugId, header, bugComments]);

  const renderComments =
    bugComments[0] && !bugComments[0].message
      ? bugComments.map((comment) => {
        return (
          <li className="comment-item" key={comment.id}>
            <div className="auth-and-comm">
              <p className="comment-author">{`Author: ${comment.userName}`}</p>
              <p className="comment-content">
                {`"`}
                {comment.comment}
                {`"`}
              </p>
            </div>
            <div className="comment-time">
              <p>{comment.createdDate}</p>
            </div>
          </li>
        );
      })
      : null;

  const commentField = (
    <label htmlFor="newComment" className="new-comment-label">
      <textarea
        required
        id="newComment"
        value={formFields.comment}
        onChange={handleOnChange('comment')}
        className="comment-input"
      />
    </label>
  );

  return (
    <div className="comments-container">
      <button
        onClick={() => history.goBack()}
        className="go-back-button"
      >
        Back to Bugs
      </button>
      <h3 className="welcome">{header}</h3>
      {openEdit()}
      <ul className="comments">{renderComments}</ul>
      <form onSubmit={handleSubmit} className="new-comment-form">
        <h3 className="welcome">Add A Comment</h3>
        {commentField}
        <footer className="form-footer">
          <button type="submit" className="new-comment-submit">
            Submit
          </button>
        </footer>
      </form>
    </div>
  );
};
export default CommentsPage;
