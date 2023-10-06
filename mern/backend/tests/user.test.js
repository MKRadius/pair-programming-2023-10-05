const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const User = require("../models/userModel");

const initialUser = {
    name: "TestUser",
    email: "test@example.com",
    password: "$Password123",
};

let token;

beforeEach(async () => {
    await User.deleteMany({});
    const user = await User.signup(
        initialUser.name,
        initialUser.email,
        initialUser.password
    );
});

describe("User API", () => {
    describe("POST /api/users", () => {
        it("should register a new user successfully", async () => {
            const newUser = {
                name: "NewUser",
                email: "newuser@example.com",
                password: "$NewPassword123",
            };
            const response = await request(app)
                .post("/api/users")
                .send(newUser);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("email", newUser.email);
            expect(response.body).toHaveProperty("token");

            token = response.body.token;
        });

        it("should not register a user with invalid data", async () => {
            const invalidUser = {
                name: "Invalid User",
                // Missing email and password
            };
            const response = await request(app)
                .post("/api/users")
                .send(invalidUser);

            expect(response.status).toBe(400);
        });
    });

    describe("POST /api/users/login", () => {
        it("should log in a user successfully", async () => {
            const response = await request(app)
                .post("/api/users/login")
                .send({
                    email: initialUser.email,
                    password: initialUser.password,
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("email", initialUser.email);
            expect(response.body).toHaveProperty("token");

            token = response.body.token;
        });

        it("should not log in a user with incorrect credentials", async () => {
            const incorrectCredentials = {
                email: "IncorrectEmail",
                password: "IncorrectPassword",
            };
            const response = await request(app)
                .post("/api/users/login")
                .send(incorrectCredentials);

            expect(response.status).toBe(400);
        });
    });

    describe("GET /api/users/me", () => {
        it("should return user id for an authenticated user", async () => {
            const response_login = await request(app)
                .post("/api/users/login")
                .send({
                    email: initialUser.email,
                    password: initialUser.password,
                });

            const token = response_login.body.token;

            const response = await request(app)
                .get("/api/users/me")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("_id");
        });

        it("should return unauthorized for an unauthenticated user", async () => {
            const response = await request(app).get("/api/users/me");

            expect(response.status).toBe(401);
        });
    });
});

afterAll(() => {
    mongoose.connection.close();
});
