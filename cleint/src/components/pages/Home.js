import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { userContext } from "../../App";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: "550px",

    margin: "10px auto",
    marginBottom: 20,
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },

  avatar: {
    backgroundColor: red[500],
  },
}));

export default function Home() {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const { state } = useContext(userContext);
  useEffect(() => {
    fetch("/allposts", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setData(result.posts);
      });
  }, []);

  const likePost = (id) => {
    fetch("/like", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => {
        res.json();
      })
      .then((result) => {
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        setData(newData);
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const unlikePost = (id) => {
    fetch("/unlike", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => {
        res.json();
      })
      .then((result) => {
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        setData(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const makeComment = (text, postId) => {
    fetch("/comment", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId,
        text,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        setData(newData);
      })
      .catch((err) => console.log(err));
  };

  const deletePost = (postid) => {
    fetch(`/deletePost/${postid}`, {
      method: "delete",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.filter((item) => {
          return item._id !== result._id;
        });
        setData(newData);
      });
  };

  return (
    <div>
      {data.map((item) => {
        return (
          <Card className={classes.root}>
            <CardHeader
              avatar={
                <Avatar aria-label="recipe" className={classes.avatar}>
                  <img
                    style={{ width: 70, height: 50 }}
                    src="https://www.washingtonpost.com/resizer/ahl9OrgfUPFD5jWrjJNsHZ0HiC4=/1484x0/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/3UUG4JSEFMI6VGOHDX6UEQNC7Y.jpg"
                  />
                </Avatar>
              }
              action={
                <IconButton aria-label="settings">
                  {item.postedBy._id === state._id && (
                    <i
                      onClick={() => {
                        deletePost(item._id);
                      }}
                      className="fa fa-trash-o"
                      style={{ fontSize: "24px" }}
                    ></i>
                  )}
                </IconButton>
              }
              title={
                <Link
                  to={
                    item.postedBy._id !== state._id
                      ? "/profile/" + item.postedBy._id
                      : "/profile/"
                  }
                >
                  <h6 style={{ color: "black" }}>{item.postedBy.name}</h6>
                </Link>
              }
              subheader={
                <p style={{ marginTop: "-1px" }}>
                  <b>{item.likes.length} </b>
                  {item.likes.length === 0 ? "like" : "likes"}
                </p>
              }
            />
            <CardMedia
              className={classes.media}
              image={item.photo}
              title="Paella dish"
            />
            <CardContent>
              <h5 style={{ textTransform: "capitalize" }}>
                Title : <small>{item.title}</small>
              </h5>
              <Typography variant="body2" color="textPrimary" component="p">
                <b>Caption</b> : {item.body}
              </Typography>

              <h5 style={{ textAlign: "center" }}>
                <u>Comments</u>
              </h5>

              {item.comments.map((record) => {
                return (
                  <h6>
                    <b> {record.postedBy.name}</b> : {record.text}
                  </h6>
                );
              })}
              <hr />
            </CardContent>
            <h6></h6>
            <CardActions disableSpacing>
              <IconButton aria-label="add to favorites">
                {item.likes.includes(state._id) ? (
                  <i
                    onClick={() => {
                      unlikePost(item._id);
                      window.location.reload();
                    }}
                    className="fa fa-thumbs-down"
                    style={{ fontSize: "24px" }}
                  ></i>
                ) : (
                  <i
                    onClick={() => {
                      likePost(item._id);
                      window.location.reload();
                    }}
                    className="fa fa-heart"
                    style={{ fontSize: "24px" }}
                  ></i>
                )}
              </IconButton>
              <div style={{ marginLeft: 10 }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    makeComment(e.target[0].value, item._id);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Add Comment"
                    style={{ width: "80vw" }}
                  />
                </form>
              </div>
            </CardActions>
          </Card>
        );
      })}
    </div>
  );
}
