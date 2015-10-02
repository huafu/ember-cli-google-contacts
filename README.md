# ember-cli-google-contacts

This addon provide access to the Google contacts of a user thru the store using the Google client
library. The plan is to support updating and creating contacts too, but for now only read-access
has been implemented.

## Installation

* `npm install --save-dev ember-cli-google-contact`
* or, with the latest `ember-cli`: `ember install:addon ember-cli-google-contact`

## Using

* The plugin requires at least a Google client ID and optionally an API key:

    ```js
    // add this to the ENV hash of config/environment.js
    social: {
      google: {
        clientId: 'xyz',
        apiKey: 'abc' // optional
        // if you want to load the library yourself with the `googleContactService.load()`,
        // set this to false. If not set or truthy, it'll automatically load with your application
        // autoLoad: true
      }
    }
    ```
    
    You can get an API key and client ID for your project by creating a new Google project
    [there](https://console.developers.google.com/)

* Routes and controllers now get a `googleContactService` property, which you need to use in order
to authenticate. Then you can use the store to retrieve the user's Google contacts.
* To detect if the lib is authenticated, use `<some controller or route>.googleContactService.get('isAuthenticated')`
* If not authenticated, you have to create a UI button with an Ember action (it has to be a button so that
the action is triggered on click) resulting in the call of `googleContactService.authenticate()`.
This method returns a promise which resolves upon authentication success or reject with the error on
failure:

    ```handlebars
    {{! app/templates/contacts/index.hbs }}
    <button {{action 'authenticate'}}>authenticate</button>
    ```

    ```js
    // app/routes/contacts/index.js
    export default Ember.Route.extend({
      beforeModel: function () {
        if (this.googleContactService.get('isAuthenticated')) {
          // go directly to the contacts list if the authentication has already been done
          this.transitionTo('contacts.list');
        }
      },
      actions: {
        authenticate: function () {
          this.googleContactService.authenticate().then(Ember.run.bind(this, 'transitionTo', 'contacts.list'));
        }
      }
    });
    ```
    
* To get the contacts list, just use the store:

    ```js
    // app/routes/contacts/list.js
    export default Ember.Route.extend({
      beforeModel: function () {
        if (!this.googleContactService.get('isAuthenticated')) {
          // if the authentication hasn't been done yet, redirect to the authenticate screen
          this.transitionTo('contacts.authenticate');
        }
      },
      model: function () {
        return this.store.findAll('google-contact');
      }
    });
    ```
    
    ```handlebars
    {{! app/templates/contacts/list.hbs }}
    <ul class="list-group contacts">
      {{#each contact in model}}
        <li class="list-group-item">
          {{#if contact.anyPhotoUrl}}
            <div class="avatar">
              <img {{bind-attr src=contact.anyPhotoUrl}}/>
            </div>
          {{/if}}
          <div class="name">{{contact.title}} - {{contact.anyEmail.address}}</div>
        </li>
      {{/each}}
    </ul>
    ```

* A `google-contact` model has these properties:
    - `id`: The Google contact ID
    - `title`: display name of the contact
    - `categories`: an array of `String` for each category
    - `emails`: an array of `{rel: String, primary: Boolean, address: String}`
    - `links`: an array of `{rel: String, type: String, href: String}`
    - `anyPhotoUrl`: an URL to the user's avatar if any
    - `anyEmail`: a pointer to the primary or first available email object from `emails`

---

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
