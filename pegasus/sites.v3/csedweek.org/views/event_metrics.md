<%
  metrics = fetch_metrics
  def addCommas(number)
    number.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
  end
%>

## Top line stats for the Hour of Code

So far, **<%= addCommas(metrics['csedweek_organizers']) %>** organizers plan to host Hour of Code for **<%= addCommas(metrics['csedweek_students']) %>** students, across **<%= addCommas(metrics['csedweek_countries']) %>** countries.

Of these, **<%= addCommas(metrics['csedweek_entire_schools']) %>** are organizing for their entire school to participate.
