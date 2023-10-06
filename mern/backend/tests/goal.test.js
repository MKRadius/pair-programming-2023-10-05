const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const Goal = require("../models/goalModel");
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

    const response = await request(app).post("/api/users/login").send({
        email: initialUser.email,
        password: initialUser.password,
    });

    token = response.body.token;
});

describe("Goal API", () => {
    describe("POST /api/goals", () => {
        it("should create a new goal successfully", async () => {
            const newGoal = {
                text: "New goal text",
            };

            const response = await request(app)
                .post("/api/goals")
                .send(newGoal)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("_id");
            expect(response.body).toHaveProperty("text", newGoal.text);
        });

        it("should not create a goal with missing data", async () => {
            const invalidGoal = {
                // Missing data
            };

            const response = await request(app)
                .post("/api/goals")
                .send(invalidGoal)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(400);
        });
    });

    describe("GET /api/goals", () => {
        it("should return goals for an authenticated user", async () => {
            const newGoal = {
                text: "Test goal text",
            };

            await request(app)
                .post("/api/goals")
                .send(newGoal)
                .set("Authorization", `Bearer ${token}`);

            const response = await request(app)
                .get("/api/goals")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it("should return unauthorized for an unauthenticated user", async () => {
            const response = await request(app).get("/api/goals");

            expect(response.status).toBe(401);
        });
    });

    describe("PUT /api/goals/:id (Update Goal)", () => {
        it("should update a goal successfully", async () => {
            const newGoal = {
                text: "Test goal text",
            };

            const createResponse = await request(app)
                .post("/api/goals")
                .send(newGoal)
                .set("Authorization", `Bearer ${token}`);

            const updatedGoal = {
                text: "Updated goal text",
            };

            const updateResponse = await request(app)
                .put(`/api/goals/${createResponse.body._id}`)
                .send(updatedGoal)
                .set("Authorization", `Bearer ${token}`);

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body).toHaveProperty(
                "_id",
                createResponse.body._id
            );
            expect(updateResponse.body).toHaveProperty(
                "text",
                updatedGoal.text
            );
        });

        it("should return a 404 error for an invalid goal ID", async () => {
            const invalidGoalId = "invalid_id";

            const response = await request(app)
                .put(`/api/goals/${invalidGoalId}`)
                .send({ text: "Updated goal text" })
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
        });

        it("should return a 400 error for a non-existent goal", async () => {
            const nonExistentGoalId = mongoose.Types.ObjectId();

            const response = await request(app)
                .put(`/api/goals/${nonExistentGoalId}`)
                .send({ text: "Updated goal text" })
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(400);
        });
    });

    describe("DELETE /api/goals/:id (Delete Goal)", () => {
        it("should delete a goal successfully", async () => {
            // Create a goal for the user
            const newGoal = {
                text: "Test goal text",
            };

            const createResponse = await request(app)
                .post("/api/goals")
                .send(newGoal)
                .set("Authorization", `Bearer ${token}`);

            const response = await request(app)
                .delete(`/api/goals/${createResponse.body._id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty(
                "_id",
                createResponse.body._id
            );
            expect(response.body).toHaveProperty(
                "text",
                createResponse.body.text
            );
        });

        it("should return a 404 error for an invalid goal ID", async () => {
            const invalidGoalId = "invalid_id";

            const response = await request(app)
                .delete(`/api/goals/${invalidGoalId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
        });

        it("should return a 400 error for a non-existent goal", async () => {
            const nonExistentGoalId = mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/api/goals/${nonExistentGoalId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(400);
        });
    });
});

afterAll(() => {
    mongoose.connection.close();
});
