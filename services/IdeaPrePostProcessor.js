"use strict";
const mask = require("json-mask");
const _ = require("underscore");
const Helpers_1 = require("../utilities/Helpers");
let helpers = new Helpers_1.default();
class IdeaPrePostProcessor {
    constructor() {
        this._ideaSkeleton = "id,user(login,id,avatar_url,name),title,overview,description,likedList,joinedList";
    }
    PreProcess(idea) {
        var sanitizedObject = mask(idea, this._ideaSkeleton);
        return helpers.ReplacePropertyValuesOf(sanitizedObject, "", null); // replace all empty strings with nulls
    }
    PostProcess(idea, user) {
        var extendedIdea = idea;
        extendedIdea.liked = _.some(idea.likedList, item => item.id === user.id);
        extendedIdea.joined = _.some(idea.joinedList, item => item.id === user.id);
        extendedIdea.likeCount = idea.likedList.length;
        extendedIdea.teamCount = idea.joinedList.length;
        return helpers.ReplacePropertyValuesOf(idea, null, "");
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IdeaPrePostProcessor;
//# sourceMappingURL=IdeaPrePostProcessor.js.map