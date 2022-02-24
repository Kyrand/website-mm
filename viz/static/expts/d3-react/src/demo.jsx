/** @jsx React.DOM */
var Thing = React.createClass({
  render: function() {
    return (
      <p>{this.props.name}</p>
    );
  }
});

var ThingList = React.createClass({
  render: function() {
    return (
      <h1>My Things:</h1>,
      <Thing name="Hello World!" />
    );
  }
});

/** @jsx React.DOM */
var StatefulThing = React.createClass({
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
            <a href="#" onClick={this.updateName}>
            My name is {this.state.name}
                        </a>
        );
    }
});

React.renderComponent(
    <div>
    <ThingList />
    <StatefulThing />
    </div>,
    document.querySelector('body')
);
