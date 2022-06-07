import { CheckBoxRounded } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import { CircularProgress, Grid, Paper, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { WebContext } from "../..";
import { PaddedDividerSpacer } from "../../pages/product";
import { Rating, Rating_Storage } from "../../utils/interface";
import { numberToStar } from "./castRating";

const RatingView: React.FC<Rating> = ({ buyer, cid, rate, status }) => {
  const [loading, setLoading] = useState(false);
  const [cidDetails, setCidDetails] = useState<Rating_Storage | undefined>();

  const instance = useContext(WebContext);

  useEffect(() => {
    (async () => {
      if(cidDetails === undefined && cid !== null) {
        const inst = await instance;
        const res = await inst.get(cid);
        const files = await res?.files();
        if (files) {
          let textData = await files[0].text();
          let parseObject = JSON.parse(textData);
          console.log(parseObject);
          setCidDetails(parseObject);
        }
      }
      
    })();
  }, []);

  return (
    <Paper
      variant="outlined"
      sx={{ padding: "10px", margin: "10px", width: "100%" }}
    >
      <Grid container>
        <Grid item xs={12} sm={6}>
          <Typography fontWeight={"bold"} color={"primary"}>
            {buyer}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          marginBottom={"20px"}
          display="flex"
          justifyContent={"flex-end"}
        >
          {numberToStar(rate)}
          {status === "RATED" ? (
            <CheckBoxRounded color="success" />
          ) : (
            <Close color="warning" />
          )}
        </Grid>
        <Grid item xs={12} sx={{wordBreak: "break-word"}}>
          <Typography fontWeight={"bold"}>Feedback CID: {cid}</Typography>
        </Grid>
        <Grid item xs={12}>
          {cidDetails ? (
            <Typography variant="body1">{cidDetails.body}</Typography>
          ) : <CircularProgress />}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RatingView;
