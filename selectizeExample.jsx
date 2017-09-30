render: function(){
        var self = this;
        return <SimpleSelect
            placeholder = "Select a library"
            ref = "select"
            options = {this.state.libraries}
            search = {this.state.search}

            // onSearchChange :: String -> (a -> Void) -> Void
            onSearchChange={function(search){
                self.setState({search: search});

                if (search.length > 0) {

                    if (!!self.req)
                        self.req.abort();

                    self.req = $.getJSON("http://api.cdnjs.com/libraries?fields=version,homepage&search=" + search)
                        .done(function(result){
                            self.setState({libraries: take(50, result.results)}, function(){
                                self.refs.select.highlightFirstSelectableOption();
                            })
                            delete self.req;
                        });

                }

            }}

            // disable client side filtering
            // filterOptions :: [Item] -> String -> [Item]
            filterOptions = {function(options, search){
                return options;
            }}

            uid = {function(item){
                return item.name;
            }}

            renderOption = {function(item){
                return <div className="simple-option" style={{fontSize: 12}}>
                    <div>
                        <span style={{fontWeight: "bold"}}>{item.name}</span>
                        <span>{"@" + item.version}</span>
                    </div>
                    <div>
                        <a href={{href: item.homepage, target: "blank"}}>{item.homepage}</a>
                    </div>
                </div>
            }}

            renderValue = {function(item){
                return <div className="simple-value">
                    <span style={{fontWeight: "bold"}}>{item.name}</span>
                    <span>{"@" + item.version}</span>
                </div>
            }}

            // render-no-results-found :: Item -> String -> ReactElement
            renderNoResultsFound = {function(value, search){
                return <div className="no-results-found" style={{fontSize: 13}}>
                    {typeof self.req == "undefined" && self.state.search.length == 0 ?
                    "type a few characters to kick off remote search":"No results found"}
                </div>
            }}/>
    },

    // getInitialState :: a -> UIState
    getInitialState: function(){
        return {
            libraries: [],
            search: ""
        }
    }

});
