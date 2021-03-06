/**
 * Created by Sangyoon on 2016-09-02.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    washerRoom: {type: Schema.Types.ObjectId, ref: 'WasherRoom', unique: false},
    title: {
        type: String,
        unique: false
    },
    author: {
        type: String,
        unique: false
    },
    articleDate: {
        type: String
    },
    content: {
        type: String
    },
    commentCount: {
        type: Number,
        default: 0
    }
});

mongoose.model('Article', ArticleSchema);