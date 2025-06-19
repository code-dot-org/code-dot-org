import ast

class InputTransformer(ast.NodeTransformer):
    def visit_Call(self, node):
        # Recursively transform child nodes first
        self.generic_visit(node)
        
        # Check if this is an input() call
        if isinstance(node.func, ast.Name) and node.func.id == 'input':
            # Check if we're already inside an Await node
            parent = getattr(node, 'parent', None)
            while parent:
                if isinstance(parent, ast.Await):
                    return node
                parent = getattr(parent, 'parent', None)
            
            # If not awaited, wrap in Await
            return ast.Await(
                value=node,
                lineno=node.lineno,
                col_offset=node.col_offset
            )
        return node

def _set_parents(node, parent=None):
    # Helper to set parent references for all nodes
    node.parent = parent
    for child in ast.iter_child_nodes(node):
        _set_parents(child, node)

def transform_code(code_str):
    try:
        # Parse the code into an AST
        tree = ast.parse(code_str)
        
        # Set parent references
        _set_parents(tree)
        
        # Transform the AST
        transformer = InputTransformer()
        new_tree = transformer.visit(tree)
        
        # Fix any missing locations
        ast.fix_missing_locations(new_tree)
        
        # Convert back to source code
        transformed_code = ast.unparse(new_tree)
        return transformed_code
    except Exception as e:
        print(f"Transformation error: {str(e)}")
        # If transformation fails, return the original code
        return code_str
