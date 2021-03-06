"use strict";

import * as nconf from 'nconf';
nconf.argv().env().file({ file: 'config.json' });

import databaseSetup from "../../infrastructure/DatabaseSetup";
import application from "../../application/application";

import { GetIdeasRequest, GetIdeasResponse } from "../../scenarios/GetIdeas";
import { EditIdeaRequest, EditIdeaResponse, EditMode } from "../../scenarios/EditIdea";

import testHelpers from "./TestHelpers";

let tableName;

describe("Edit Idea Scenario", function () {
    beforeEach(async (done) => {
        tableName = `Ideas_${testHelpers.GenerateRandomNumber()}`;
        await databaseSetup.SetupNoSqlTables(tableName);
        done();
    });

    afterEach(async (done) => {
        await databaseSetup.BringDownNoSqlTables(tableName);
        done();
    });

    it("When user is authorized, editing an idea's title does update the title correctly", async function (done) {

        let testLoggedOnUser: ILoggedOnUser = {
            id: "1",
            username: "hakant",
            displayName: "Hakan Tuncer",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        // Setup
        let idea = testHelpers.GenerateIdeaWithId("123", testLoggedOnUser, 0, 0,
            {
                id: "1",
                login: "hakant",
                name: "Hakan Tuncer",
                avatar_url: "AvatarURL"
            }
        );
        await testHelpers.InsertIdea(testLoggedOnUser, idea);

        // Act
        const updatedTitle = "Updated Title!";
        idea.title = updatedTitle;

        let updateRequest = new EditIdeaRequest();
        updateRequest.idea = idea;
        updateRequest.user = testLoggedOnUser;
        updateRequest.mode = EditMode.Title;

        await application.ExecuteAsync<EditIdeaRequest, EditIdeaResponse>(updateRequest);
        
        var request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(1);
        expect(response.ideas[0].title).toEqual(updatedTitle);

        done();
    });

    it("When user is authorized, editing an idea's overview does update the overview correctly", async function (done) {

        let testLoggedOnUser: ILoggedOnUser = {
            id: "1",
            username: "hakant",
            displayName: "Hakan Tuncer",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        // Setup
        let idea = testHelpers.GenerateIdeaWithId("123", testLoggedOnUser, 0, 0,
            {
                id: "1",
                login: "hakant",
                name: "Hakan Tuncer",
                avatar_url: "AvatarURL"
            }
        );
        await testHelpers.InsertIdea(testLoggedOnUser, idea);

        // Act
        const updatedOverview = "Updated Overview!";
        idea.overview = updatedOverview;

        let updateRequest = new EditIdeaRequest();
        updateRequest.idea = idea;
        updateRequest.user = testLoggedOnUser;
        updateRequest.mode = EditMode.Overview;

        await application.ExecuteAsync<EditIdeaRequest, EditIdeaResponse>(updateRequest);
        
        var request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(1);
        expect(response.ideas[0].overview).toEqual(updatedOverview);

        done();
    });

    it("When user is authorized, editing an idea's description does update the description correctly", async function (done) {

        let testLoggedOnUser: ILoggedOnUser = {
            id: "1",
            username: "hakant",
            displayName: "Hakan Tuncer",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        // Setup
        let idea = testHelpers.GenerateIdeaWithId("123", testLoggedOnUser, 0, 0,
            {
                id: "1",
                login: "hakant",
                name: "Hakan Tuncer",
                avatar_url: "AvatarURL"
            }
        );
        await testHelpers.InsertIdea(testLoggedOnUser, idea);

        // Act
        const updatedDescription = "Updated Description!";
        idea.description = updatedDescription;

        let updateRequest = new EditIdeaRequest();
        updateRequest.idea = idea;
        updateRequest.user = testLoggedOnUser;
        updateRequest.mode = EditMode.Description;

        await application.ExecuteAsync<EditIdeaRequest, EditIdeaResponse>(updateRequest);
        
        var request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(1);
        expect(response.ideas[0].description).toEqual(updatedDescription);

        done();
    });

    it("When user is not an admin nor the idea owner, editing an idea is not authorized", async function (done) {

        let testLoggedOnUser: ILoggedOnUser = {
            id: "1",
            username: "hakant",
            displayName: "Hakan Tuncer",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        // Setup
        let idea = testHelpers.GenerateIdeaWithId("1234", testLoggedOnUser, 0, 0,
            {
                id: "1",
                login: "hakant",
                name: "Hakan Tuncer",
                avatar_url: "AvatarURL"
            }
        );
        
        await testHelpers.InsertIdea(testLoggedOnUser, idea);

        // Act

        testLoggedOnUser = {
            id: "8782",
            username: "guest",
            displayName: "Guest User",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        const originalTitle = idea.title;
        const updatedTitle = "Updated Title!";
        idea.title = updatedTitle;

        let updateRequest = new EditIdeaRequest();
        updateRequest.idea = idea;
        updateRequest.user = testLoggedOnUser;
        updateRequest.mode = EditMode.Title;

        try{
            await application.ExecuteAsync<EditIdeaRequest, EditIdeaResponse>(updateRequest);
        } catch(err){

            expect(err.message).toBe("Action is not authorized!");

            var request = new GetIdeasRequest();
            request.user = testLoggedOnUser;

            var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
            expect(response.ideas.length).toBe(1);
            expect(response.ideas[0].title).toEqual(originalTitle);

            done();
            
            return;
        }

        done.fail("EditIdea operation did not throw the expected error!");
    });

    it("When user is an admin, editing an idea is authorized even if not the owner", async function (done) {

        let testLoggedOnUser: ILoggedOnUser = {
            id: "745",
            username: "guest",
            displayName: "Random Person",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        // Setup
        let idea = testHelpers.GenerateIdeaWithId("1234", testLoggedOnUser, 0, 0,
            {
                id: "745",
                login: "guest",
                name: "Random Person",
                avatar_url: "AvatarURL"
            }
        );
        
        await testHelpers.InsertIdea(testLoggedOnUser, idea);

        // Act

        testLoggedOnUser = {
            id: "1",
            username: "hakant",
            displayName: "Hakan Tuncer",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        const updatedTitle = "Updated Title!";
        idea.title = updatedTitle;

        let updateRequest = new EditIdeaRequest();
        updateRequest.idea = idea;
        updateRequest.user = testLoggedOnUser;
        updateRequest.mode = EditMode.Title;

        await application.ExecuteAsync<EditIdeaRequest, EditIdeaResponse>(updateRequest);
        
        var request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(1);
        expect(response.ideas[0].title).toEqual(updatedTitle);

        done();
    });

    it("When user is not an admin but the owner, editing an idea is authorized", async function (done) {

        let testLoggedOnUser: ILoggedOnUser = {
            id: "745",
            username: "guest",
            displayName: "Random Person",
            _json: {
                avatar_url: "AvatarURL"
            }
        };

        // Setup
        let idea = testHelpers.GenerateIdeaWithId("1234", testLoggedOnUser, 0, 0,
            {
                id: "745",
                login: "guest",
                name: "Random Person",
                avatar_url: "AvatarURL"
            }
        );
        
        await testHelpers.InsertIdea(testLoggedOnUser, idea);

        // Act

        const updatedTitle = "Updated Title!";
        idea.title = updatedTitle;

        let updateRequest = new EditIdeaRequest();
        updateRequest.idea = idea;
        updateRequest.user = testLoggedOnUser;
        updateRequest.mode = EditMode.Title;

        await application.ExecuteAsync<EditIdeaRequest, EditIdeaResponse>(updateRequest);
        
        var request = new GetIdeasRequest();
        request.user = testLoggedOnUser;

        var response = await application.ExecuteAsync<GetIdeasRequest, GetIdeasResponse>(request);
        expect(response.ideas.length).toBe(1);
        expect(response.ideas[0].title).toEqual(updatedTitle);

        done();
    });
    
});