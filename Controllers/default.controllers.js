import { Request, Response } from "express";

/**
 * Responds with "Hello World"
 * @param {Request} req HTTP Response Object
 * @param {Response} res HTTP Response Object
 */
const ping = (req, res) => {
  res.send("Hello World");
};

module.exports = { ping };
