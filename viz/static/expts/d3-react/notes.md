### development
Same happened to me.
Try this command line:

    jsx --watch -x jsx src/ build/

### code-snippets:
Yes, if you don't modify a subtree within React then the DOM won't be touched at all. It's easy to wrap non-React functionality like a Handlebars template in React. You can either use dangerouslySetInnerHTML:

    render: function() 
        return <div dangerouslySetInnerHTML={{__html: template(values)}}>;
    }
    or you can simply return an empty div and populate (or attach event handlers, etc) it in componentDidMount:

    render: function() 
        return <div />;
    },
    componentDidMount: function() {
        var node = this.getDOMNode();
        node.innerHTML = template(values);
    }

In the latter case, React won't touch the DOM after the initial render because render always returns the same thing.

...

Update window dimensions:
    var WindowDimensions = React.createClass({
        render: function() {
            return <span>{this.state.width} x {this.state.height}</span>;
        },
        updateDimensions: function() {
            this.setState({width: $(window).width(), height: $(window).height()});
        },
        componentWillMount: function() {
            this.updateDimensions();
        },
        componentDidMount: function() {
            window.addEventListener("resize", this.updateDimensions);
        },
        componentWillUnmount: function() {
            window.removeEventListener("resize", this.updateDimensions);
        }
    });

...
http://stackoverflow.com/questions/21903604/is-there-any-proper-way-to-integrate-d3-js-graphics-into-facebook-react-applicat
One strategy might be to build a black-box component that you never let React update. The component life cycle method shouldComponentUpdate() is intended to allow a component to determine on its own whether or not a rerender is necessary. If you always return false from this method, React will never dive into child elements (that is, unless you call forceUpdate()), so this will act as a sort of firewall against React's deep update system.

Use the first call to render() to produce the container for the chart, then draw the chart itself with D3 within the componentDidMount() method. Then it just comes down to updating your chart in response to updates to the React component. Though you might not supposed to do something like that in shouldComponentUpdate(), I see no real reason you can't go ahead and call the D3 update from there (see the code for the React component's _performUpdateIfNecessary()).

So your component would look something like this:

    React.createClass({
        render: function() {
            return <svg></svg>;
        },
        componentDidMount: function() {
            d3.select(this.getDOMNode())
                .call(chart(this.props));
        },
        shouldComponentUpdate: function(props) {
            d3.select(this.getDOMNode())
                .call(chart(props));
            return false;
        }
    });
Note that you need to call your chart both in the componentDidMount() method (for the first render) as well as in shouldComponentUpdate() (for subsequent updates). Also note that you need a way to pass the component properties or state to the chart, and that they are context-specific: in the first render, they have already been set on this.props and this.state, but in later updates the new properties are not yet set on the component, so you need to use the function parameters instead.

See the jsfiddle here.
