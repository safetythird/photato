/*
  Search the Flickr API for publi photos matching a keyword.
  For each photo, the user can call a server endpoint that will save the photo to the database
  in small, medium, large and potato sizes.
*/

'use strict'

let Backbone = require('backbone')
let _ = require('underscore')
let $ = require('jquery')
let utils = require('./utils')

let SearchTemplate = require('./html/search.html')
let ResultTemplate = require(('./html/result.html'))

const SEARCHURL = '/api/search'
const SAVEURL = '/api/save'
const hashregex = /^#(.+)/


/*
  Setup jQuery CSRF headers
*/
let csrftoken = utils.getCookie('csrftoken')
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!utils.csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

/*
  Models
*/

let User = Backbone.Model.extend({
  defaults: {
      anonymous: true,
      username: ''
  }
})

let SearchResult = Backbone.Model.extend({
  defaults: {
      saved: false,
      error: null
  },
  save (callback) {
    // Just post the raw search result to the server, and it will handle the rest
    $.ajax(SAVEURL, {data: this.toJSON(), method: 'POST'}).done((rsp) => {
      console.log(rsp)
      this.set({saved: true})
      callback && callback(null, rsp)
    }).error((error) => {
      callback && callback(error)
    })
  }
})

let SearchResultList = Backbone.Collection.extend({
  model: SearchResult,
  comparator: 'order'
})

let currentResults = new SearchResultList

let Search = Backbone.Model.extend({
  defaults: {
      query: '',
      pages: 1,
      currentPage: 1,
      perPage: 0,
      total: 0,
      loading: false,
      error: null
  },
  runSearch () {
    let data = {
      query: this.attributes.query,
      page: this.attributes.currentPage
    }
    this.set({loading: true})
    $.ajax(SEARCHURL, {data}).done((rsp) => {
      let photos = rsp.photos
      // Update the search stats
      this.set({
        currentPage: photos.page,
        pages: photos.pages,
        perPage: photos.perpage,
        total: photos.total,
        error: null
      })
      // Update current results
      currentResults.reset(photos.photo)
    }).error((error) => {
      currentResults.reset()
      this.set({error: 'Server error'})
    }).always(() => {
      this.set({loading: false})
    })
  }
})

let currentSearch = new Search

/*
  Views
*/

let SearchResultView = Backbone.View.extend({
  tagName: 'div',
  template: _.template(ResultTemplate),
  events: {
    'click button': 'save'
  },
  initialize () {
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.model, 'destroy', this.remove)
  },
  render () {
    this.$el.html(this.template(this.model.toJSON()))
    return this
  },
  save () {
    this.model.save((err, rsp) => {
      if (err && err.status === 401) {
        // Redirect to login page if not logged in
        window.location.href = '/login'
      }
    })
  }
})

let SarchResultsListView = Backbone.View.extend({
  el: $('#search-results'),
  initialize () {
    this.listenTo(currentResults, 'change', this.render)
    this.listenTo(currentResults, 'reset', this.render)
    this.listenTo(currentResults, 'destroy', this.remove)
  },
  render () {
    this.$el.empty()
    currentResults.each((result) => {
      let view = new SearchResultView({model: result})
      this.$el.append(view.render().el)
    })
  }
})

let resultsView = new SarchResultsListView

let SearchView = Backbone.View.extend({
  el: $('#search'),
  template: _.template(SearchTemplate),
  events: {
    'submit form': 'runSearch'
  },
  initialize () {
    this.listenTo(currentSearch, 'change', this.render)
    let query = hashregex.exec(window.location.hash)
    query = query && query[1]
    if (query) {
      currentSearch.set({query})
      currentSearch.runSearch()
    }
    this.render()
  },
  render () {
    this.$el.html(this.template(currentSearch.toJSON()))
    return this
  },
  runSearch (e) {
    e.preventDefault()
    let query = $('#search-query').val()
    window.location.hash = query
    currentSearch.set({query})
    currentSearch.runSearch()
  },
  nextPage () {
    currentSearch.set('page', currentSearch.page + 1)
    currentSearch.runSearch()
  },
  prevPage () {
    currentSearch.set('page', currentSearch.page - 1)
    currentSearch.runSearch()
  }
})

let searchView = new SearchView
