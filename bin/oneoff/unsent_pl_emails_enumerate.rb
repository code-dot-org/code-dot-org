#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

# This is a little scrappy, but it's designed to figure out which of the PL emails,
# that we didn't send between 01 Oct 2018 and 21 June 2019, needed to be resent.
# Aside from emails that regional managers knew we needed to send or not send,
# there were two categories that needed additional investigation, and those are
# reflected here.  As it turned out, we discovered one email from each of these
# two categories that needed to be resent.

$send_no_workshop_yet = %w(
  36044807
  35997126
  36013783
  36058874
  36044808
  36058894
  36069982
  35997127
  36013784
  36058875
  35836932
  35988777
  35822989
  35497901
  36005322
  35453682
  35387408
  35387409
  35387410
  35387411
  35387412
  35387413
  35387414
  35387415
  35387416
  36040518
  36040519
  36040520
  36040521
  36040522
  36040523
  36040524
  36040525
  36040526
  36040527
  35963611
  35963612
  35963613
  35963614
  35957500
  35957501
  35957502
  36129026
  36069123
  36124677
  36129801
  36134154
  36134155
  36033035
  36134156
  36134157
  36134158
  36134159
  36134160
  36134161
  36129810
  36134162
  36134163
  36129812
  36124693
  36134165
  36132374
  36134166
  36134167
  36134168
  36132633
  36134169
  36134170
  36135450
  36134171
  36134172
  36077087
  35819551
  35819552
  35819553
  35819554
  36132387
  35819555
  36139556
  35819556
  35819557
  35819558
  35819559
  36129832
  35819560
  35501864
  35819561
  35819562
  35819563
  35819564
  36039212
  35819565
  35819566
  35819567
  35819568
  35819569
  35819570
  35819571
  36061492
  35819572
  35819573
  35819574
  35493174
  36129591
  35819575
  36121144
  36135480
  35819576
  36121145
  35483961
  35819577
  36121146
  35819578
  36121147
  36130107
  35819579
  36121148
  35482684
  35819580
  36121149
  35819581
  36121150
  36129854
  35819582
  36121151
  35819583
  36121152
  36133184
  35819584
  36121153
  35819585
  36121154
  35482946
  35819586
  36121155
  35819587
  36121156
  35819588
  36121157
  36133701
  36121158
  36129862
  36121159
  36121160
  36121161
  36130635
  36130124
  35482704
  35485008
  35489617
  36117074
  36132947
  36132440
  36130142
  36134498
  36128867
  36129381
  36130149
  36132199
  35826281
  35826282
  35828586
  35826283
  35826284
  35960940
  35826285
  35826286
  35483759
  35826287
  35826288
  35826289
  35826290
  35826291
  36132724
  35826292
  36116853
  35826293
  35826294
  35826295
  35826296
  35826297
  35826298
  35826299
  35826300
  36079229
  35826301
  36043389
  36139134
  35826302
  35482495
  35826303
  35826304
  35826305
  35826306
  35826307
  35826308
  35826309
  35494022
  35826310
  35826311
  36129928
  35826312
  36132233
  35826313
  35826314
  35826315
  35826316
  36039308
  35826317
  35482510
  35826318
  36039569
  36072606
  35483810
  35954604
  36132783
  35482544
  36053937
  36138934
  35490232
  36138689
  36138692
  35484100
  36131782
  35493062
  36131784
  36135113
  36129997
  36139214
  35489490
  35482839
  36094171
  35493085
  36131808
  36125921
  35483105
  36130535
  35484140
  35995373
  36075759
  36138995
  36081656
  36040443
  36046333
  35821289
  35821290
  35821291
  35821292
  35818774
  35817259
  35817260
  36118596
  35821124
  35821125
  35821126
  36182362
  36131686
  35808872
  36168306
  36020867
  36005887
)

$send_no_principal_approval_no_workshop_yet = %w(
  35972819
  36160951
  36156563
  36138537
  36147612
  36155496
  35985578
  36089553
  36017024
)

# Conditional: send if assigned or enrolled workshop hasn't happened
def get_ids_for_no_workshop_yet
  ids_to_send = []

  started_workshop_count = 0
  started_assigned_workshop_count = 0

  # Conditional: send if workshop hasn't happened
  $send_no_workshop_yet.each do |poste_id|
    # Get the email
    contact_email = PEGASUS_DB[:poste_deliveries].where(id: poste_id).first[:contact_email]

    # Let's see if there is an assigned workshop that hasn't happened...

    # Find the user
    user = User.find_by_email(contact_email)

    # Find the teacher application
    application = Pd::Application::TeacherApplication.where(user: user).first

    puts "** id: #{poste_id}, email: #{contact_email}, user? #{!user.nil?}, application? #{!application.nil?}"

    if application
      # Has the assigned workshop not yet started?
      assigned_workshop_id = application.pd_workshop_id

      puts "  found an assigned!"

      if Pd::Workshop.find(assigned_workshop_id).started_at.nil?
        ids_to_send << poste_id unless ids_to_send.include? poste_id
        puts "  let's resend to #{contact_email}"
      else
        puts "  assigned already started at: #{Pd::Workshop.find(enrollment_id).started_at}"
        started_assigned_workshop_count += 1
      end
    end

    # Let's see if there is an enrollment that hasn't happened...

    Pd::Enrollment.where(email: contact_email).all.each do |enrollment|
      enrollment_id = enrollment.pd_workshop_id

      puts "  found an enrollment!"

      # Has the workshop for that enrollment not yet started?
      if Pd::Workshop.find(enrollment_id).started_at.nil?
        ids_to_send << poste_id unless ids_to_send.include? poste_id
        puts "  let us resend to #{contact_email} since class starts #{Pd::Workshop.find(enrollment_id).started_at}"
      else
        puts "  enrolled started at: #{Pd::Workshop.find(enrollment_id).started_at}"
        started_workshop_count += 1
      end
    end
  end

  puts "#{started_workshop_count} workshops started.  #{started_assigned_workshop_count} assigned workshops started."
  ids_to_send
end

# Conditional: send if no principal approval & assigned workshop hasn't happened
def get_ids_for_no_principal_approval_no_workshop_yet
  ids_to_send = []

  $send_no_principal_approval_no_workshop_yet.each do |poste_id|
    # Get the email
    contact_email = PEGASUS_DB[:poste_deliveries].where(id: poste_id).first[:contact_email]

    puts "## Contact email: #{contact_email}"

    # Find the teacher application that had this principal's email address
    application = Pd::Application::TeacherApplication.all.select {|a| (JSON.parse(a.form_data)["principalEmail"] == contact_email)}.first

    if application
      if Pd::Application::PrincipalApprovalApplication.where(application_guid: application.application_guid).empty?

        assigned_workshop_id = application.pd_workshop_id

        if assigned_workshop_id
          workshop = Pd::Workshop.find(assigned_workshop_id)

          if workshop.started_at.nil?
            ids_to_send << poste_id
            puts "let's resend!"
          else
            puts "  workshop already started at: #{workshop.started_at}"
          end
        else
          puts "  teacher application found but didn't have an assigned pd_workshop_id"
        end
      else
        puts "  principal approval found"
      end
    else
      puts "  no teacher application found with principalEmail: #{contact_email}"
    end
  end

  ids_to_send
end

ActiveRecord::Base.transaction do
  result = get_ids_for_no_workshop_yet
  puts "*** no workshop yet: We will resend #{result.count} of #{$send_no_workshop_yet.length}"

  result = get_ids_for_no_principal_approval_no_workshop_yet
  puts "*** no principal approval and no workshop yet: We will resend #{result.count} of #{$send_no_principal_approval_no_workshop_yet.length}"

  # This script is a dry-run unless we comment out this last line
  raise ActiveRecord::Rollback.new, "Intentional rollback"
end
