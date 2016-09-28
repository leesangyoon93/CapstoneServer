/**
 * Created by Sangyoon on 2016-09-26.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    article: {type: Schema.Types.ObjectId, ref: 'Article', unique: false},
    author: {
        type: String,
        unique: false
    },
    content: {
        type: String,
        unique: false
    }
});

mongoose.model('Comment', CommentSchema);