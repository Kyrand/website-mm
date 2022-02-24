/** @jsx React.DOM */
var Thing = React.createClass({displayName: 'Thing',
  render: function() {
    return (
      React.DOM.p(null, this.props.name)
    );
  }
});

var ThingList = React.createClass({displayName: 'ThingList',
  render: function() {
    return (
      React.DOM.h1(null, "My Things:"),
      Thing({name: "Hello World!"})
    );
  }
});

/** @jsx React.DOM */
var StatefulThing = React.createClass({displayName: 'StatefulThing',
    updateName: function(event) {
        event.preventDefault();
        this.setState({name: 'Taylor'});
        // this.state.name = "Taylor";
        //   this.render();
    },
    getInitialState: function() {
        return (
        {name: "World"}
        );
    },
    render: function() {
        return (
            React.DOM.a({href: "#", onClick: this.updateName}, 
            "My name is ", this.state.name
                        )
        );
    }
});

React.renderComponent(
    React.DOM.div(null, 
    ThingList(null), 
    StatefulThing(null)
    ),
    document.querySelector('body')
);
