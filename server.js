import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import express from "express";
const app = express();
const PORT = process.env.PORT || 8001;
// mongodb connection
import { dbConnection } from "./src/config/dbConfig.js";
dbConnection();
//webhook parser
app.use("/api/v1/stripewebhook", stripeHook);
// middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// APIS
import categoriesRouter from "./src/routers/categoriesRouter.js";
import productsRouter from "./src/routers/productsRouter.js";
import itemsRouter from "./src/routers/itemsRouter.js";
import usersRouter from "./src/routers/usersRouter.js";
import cartRouter from "./src/routers/cartRouter.js";
import favRouter from "./src/routers/favRouter.js";
import stripeHook from "./src/routers/stripeWebHooks.js";
import paymentRouter from "./src/routers/paymentRouter.js";

app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/items", itemsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/favs", favRouter);
app.use("/api/v1/payment", paymentRouter);

app.use("/", (req, res, next) => {
  res.json({
    status: "success",
    message: "You hit the server root",
  });
  next(error);
});
app.use((error, req, res, next) => {
  console.log(error);
  const statusCode = error.status || 404;
  res.status(statusCode).json({
    status: "error",
    message: error.message,
  });
});

app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(
        `Client application server running on http://localhost:${PORT}`
      );
});
