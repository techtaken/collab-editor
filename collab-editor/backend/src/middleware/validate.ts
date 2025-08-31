import { ZodObject } from "zod";
import { RequestHandler } from "express";

type ParsedQs = Record<string, string | string[]>;
type ParamsDictionary = Record<string, string>;

export function validate(schemas: { body?: ZodObject; query?: ZodObject; params?: ZodObject }): RequestHandler {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query) as ParsedQs;
      if (schemas.params) req.params = schemas.params.parse(req.params) as ParamsDictionary;
      next();
    } catch (err: any) {
      res.status(400).json({ message: "Validation error", details: err.errors ?? String(err) });
    }
  };
}
