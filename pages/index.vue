<template>
    <section class="container">
        <header>
        <span>
            <span><label :style="toggleSwitchLabelStyle(1)">以附議數量排序</label></span>
            <span><ToggleButton 
            @change="switchSorting()"
            :value="sort_by_time"
            :color="{checked: 'green',unchecked: 'blue'}" />
            </span>
            <span><label :style="toggleSwitchLabelStyle(2)">以提問時間排序</label></span>
        </span>
        </header>

    <span class="container-toolbar">
        <div class="searchbox">
            Search the tag...
            <input type="text" placeholder="" @change="searchtag">
        </div>
        <br />
        <b-button 
            class="forminvokeButton"
            variant="primary"
            size="sm"
            @click="openModal()">舉手發問
        </b-button>
    </span>

    <span class="container-topic">
        <!-- <ul v-if="!currentUser"> -->
        <li v-for="topic in fileteredTopics" :key="topic.id">
            <topic
                :topicToShowed="topic"
                :loginUser="currentUser.username" 
                @delete="deletetopic"
                @update="updateTopic"
                @selecttopic="selecttopic" />
        </li>
        <!-- </ul> -->
    </span>

    <b-modal id="submit-modal" v-model="showModal" hide-footer>
        <div id="inputarea">
            <topicForm
                :topic-to-showed="selectedTopic"
                :login-user="currentUser.username"
                @update="updateTopic"
                @insert="insertTopic" />
        </div>
        <b-button class="closeModal" size="sm" @click="closeModal()">Close</b-button>
    </b-modal>
  </section>
</template>

<script>
import Vue from 'vue';
import io from 'socket.io-client';
import { ToggleButton } from 'vue-js-toggle-button';
import { Button, Modal } from 'bootstrap-vue/es/components';
import moment from 'moment';
import topicForm from '~/components/topicForm.vue';
import topic from '~/components/topic.vue';
const socket = io('http://localhost:3001');

const timeFormat='YYYY-MM-DD  HH:mm:ss';
let bus=new Vue();

socket.on('mongo_sync', function(msg){
    // console.log(msg);
    const collectionFetchedBySecond = msg.bySecond.slice();
    const collectionFetchedByTime = msg.byTime.slice();
    bus.$emit('trigger', {collectionFetchedBySecond, collectionFetchedByTime});
});

export default {
    components: {
        ToggleButton,
        Button,
        Modal,
        topicForm,
        topic,
    },
        
    mounted: function() {
        let self = this;
        bus.$on('trigger', function(content){
            self.topics = content.collectionFetchedBySecond;
            self.topics_time = content.collectionFetchedByTime;
        });
    },

    // props: {

    // },

    data: function() {
        return {
            topics:[],
            topics_time:[],
            currentUser:{username:"noone"},
            tags:[],
            sort_by_time: false,
            showModal: false,
            selectedTopic:{},
        };
    },

    computed: {
        fileteredTopics: function() {
            let sortedTopics;
            if(this.sort_by_time === true) {
                sortedTopics = this.topics_time;
            }
            else {
                sortedTopics = this.topics;
            }
            // console.log("sortedTopics="+sortedTopics+", tags="+this.tags);
            return this.getTopicsIncludeTags(sortedTopics, this.tags, true);
        },
    },

    methods: {
        toggleSwitchLabelStyle(labelnum){
            const style_enabled = {color:'black', opacity:1};
            const style_disabled = {color:'gray', opacity:0.5};
            if(labelnum === 1) {
                return this.sort_by_time ? style_disabled : style_enabled;
            }
            else {
                return this.sort_by_time ? style_enabled : style_disabled;
            }
        },

        switchSorting() {
            this.sort_by_time = !this.sort_by_time;
        },

        searchtag: function(event) {
            const tags = event.target.value.split(' ').filter((tag) => (tag !== ''));
            this.tags = tags;
        },

        openModal() {
            if((this.currentUser.username !== 'admin') ||
               (this.selectedTopic.title !== undefined)) {
                this.showModal = true;
            }
        },

        closeModal() {
            this.showModal = false;
        },

        getTopicsIncludeTags(sourceTopics, targetTags, blur) {
            if(blur === true) {
                // match if contains
                return targetTags.reduce(function(resultTopics, tag) {
                        return resultTopics.filter(function(topic) {
                                let result = false;
                                topic.tags.forEach(function(topictag) {
                                if(topictag.indexOf(tag) !== -1) {
                                    result = true;
                                }
                                });
                                return result;
                                });
                        }, sourceTopics);
            }
            else {
                // absolute match
                return targetTags.reduce(function(resultTopics, tag) {
                        return resultTopics.filter((topic) => (topic.tags.includes(tag)));
                        }, sourceTopics);
            }
        },

        updateTopic(topicToUpdate) {
            socket.emit('update', topicToUpdate);
            this.closeModal();
        },

        insertTopic(topic) {
            
            topic.raisedAt = moment().format(timeFormat);
            topic.sponsor = this.currentUser.username;
            topic.seconded = 1;
            topic.secondlist = [topic.sponsor];
            topic.replied = 0;
            topic.repliedTime = '';
            topic.answer = '';
            topic.accept = 0;
            topic.acceptlist = [];
            topic.suck = 0;
            topic.sucklist = [];

            socket.emit('insert', topic);

            this.closeModal();
        },

        deletetopic(topicTodelete) {
            // console.log(topicTodelete);
            socket.emit('delete', topicTodelete);
        },

        selecttopic(topic) {
            this.selectedTopic = topic;
            this.openModal();
        },
    }
}
</script>

<style>
body {
    /*font-family: sans-serif;*/
    font-family: 'Microsoft JhengHei','Heiti TC','WenQuanYi Zen Hei', Helvetica;
    background-color: #315481;
    background-image: linear-gradient(to bottom, #315481, #918e82 100%);
    background-attachment: fixed;
   
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
   
    padding: 0;
    padding-top: 3%;
    margin: 0;
   
    font-size: 14px;
    word-break: break-all;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    margin-bottom: 1em;
    padding-bottom: 1em;
    min-height: 100%;
    background: transparent;
}

.container-topic {
    width: 75%;
    /*width: 600px;*/
    /*margin: 0 auto;*/
    margin-bottom: 1em;
    padding-bottom: 1em;
    min-height: 100%;
    background: white;
    float:right;
}

.container-toolbar {
    width: 25%;
    /*max-width: 200px;*/
    /*margin: 0 auto;*/
    /*margin-bottom: 1em;*/
    padding-bottom: 1em;
    min-height: 100%;
    background: #FAEBD7;
    color: #696969;
    float:left;
}

.searchbox {
    padding: 1em 0 0 0.8em;
}

.forminvokeButton {
    /*height:200px;*/
    /*width:180px;*/
    margin:0 0 0 0.8em;
}

.buttongroup, .closeModal {
    float: right;
}

li {
    position: relative;
    list-style: inside upper-roman;
    padding: 15px;
    border-bottom: #eee solid 1px;
    overflow: auto;
}
 
li .text {
    margin-left: 10px;
}
 
li.checked {
    color: #888;
}
 
li.checked .text {
    text-decoration: line-through;
}
 
li.private {
    background: #eee;
    border-color: #ddd;
}

header {
    background: #d2edf4;
    background-image: linear-gradient(to bottom, #d0edf5, #e1e5f0 100%);
    padding: 2.5% 2% 0% 2.5%;
    position: relative;
    /*font-size: 1.5em;*/
}

header.title {
    font-size: 2em;
}

.title {
    font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
        'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    display: block;
    font-weight: 300;
    font-size: 100px;
    color: #35495e;
    letter-spacing: 1px;
}

.subtitle {
    font-weight: 300;
    font-size: 42px;
    color: #526488;
    word-spacing: 5px;
    padding-bottom: 15px;
}

.links {
    padding-top: 15px;
}
</style>
