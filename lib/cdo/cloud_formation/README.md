# `Cdo::CloudFormation` module

Classes and modules related to managing CloudFormation templates.

[`AWS::CloudFormation`](../../../lib/cdo/aws/cloud_formation.rb) uses a [`StackTemplate`](stack_template.rb) to render a template document to a string, which is used to create/update a CloudFormation stack.

## [`StackTemplate`](stack_template.rb)
Controller class that provides the ERB binding context for a CloudFormation stack template.
Includes helper methods for rendering CloudFormation stack templates.

## [`CdoApp < StackTemplate`](cdo_app.rb)
Stack-template context with constants and helper-methods specific to the monolithic Code.org application stack.
