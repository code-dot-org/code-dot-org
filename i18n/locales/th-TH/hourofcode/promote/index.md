---
title: <%= hoc_s(:title_how_to_promote) %>
layout: wide
nav: promote_nav
---
<%= view :signup_button %>

<% facebook = {:u=>"http://#{request.host}/th"}

twitter = {:url=>"http://hourofcode.com", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)} twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode' %>

# ชวนชุมชน​ของคุณเข้ามามีส่วนร่วม​ใน​ Hour of Code

## 1. เผยแพร่ต่อไป

บอกเพื่อนๆเกี่ยวกับ​ **#HourOfCode**!

<%= view :share_buttons, facebook:facebook, twitter:twitter %>

## 2. Ask your whole school to offer an Hour of Code

[ส่งเมล​](%= resolve_url('/promote/resources#sample-emails') %) หาผอ. โรงเรียนและท้าทายทุกห้องเรียน​ให้ลงทะเบียน​

## 3. ชักชวนนายจ้างของคุณเข้ามามีส่วนร่วม

[ส่งเมล​](%= resolve_url('/promote/resources#sample-emails') %)หาผู้จัดการ​หรือ​ CEO

## 4. โปรโมท Hour of Code ในชุมชนของคุณ

[โน้มน้าวกลุ่มต่างๆ](%= resolve_url('/promote/resources#sample-emails') %)— ลูกเสือ​ เนตร​นารี​ วัด​ มหาวิทยาลัย​ องค์กร​ทหาร​ผ่าน​ศึก​ สหภาพแรงงาน​ หรือแม้กระทั่ง​เพื่อนๆ คุณ​ไท่จำเป็นต้อง​อยู่ในโรงเรียน​เพื่อเรียน​ทักษะ​ใหม่​ ใช้ [โพสเตอร์​ ป้าย​ สติ๊กเกอร์​ วีดีโอ​ ฯลฯ​](%= resolve_url('/promote/resources') %) สำหรับ​กิจกรรม​ของ​คุณ​

## 5. ขอให้ผู้แทน​ท้องถิ่นสนับสนุน​ Hour​ of Code

[ส่งเมล​](%= resolve_url('/promote/resources#sample-emails') %) หาผู้แทนท้องถิ่น​ ผู้ใหญ่​บ้าน​ หรือกรรมการ​โรงเรียน​ เพื่อชวนให้มาร่วม​กิจกรรม​ Hour​ ​of​ Code​ มันสามารถช่วยสร้างการสนับสนุนสำหรับ​วิทยาศาสตร์​คอมพิวเตอร์ในพื้นที่ของคุณต่อไปได้

<%= view :signup_button %>