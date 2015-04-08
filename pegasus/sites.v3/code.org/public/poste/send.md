## Send Test Message

<form action="/v2/poste/send-message" method="post">
  <table>
    <tr>
      <th>Message template</th>
      <td><input name="template" type="text"/></td>
    </tr>
    
    <tr>
      <th>Recipients</th>
      <td><textarea name="recipients"></textarea></td>
    </tr>
    
    <tr>
      <th>Parameters<br/>(optional, JSON formatted)</th>
      <td><textarea name="params"></textarea></td>
    </tr>
    
    <tr>
      <th></th>
      <td><input type="submit"/></td>
  <table>
</form>
