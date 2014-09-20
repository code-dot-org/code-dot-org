class PrizeMailer < ActionMailer::Base
  default from: 'noreply@code.org'

  def prize_earned(student)
    # student prizes disabled
    # mail to: student.email, subject: I18n.t('prize_mail.prize_earned.subject')
  end

  def teacher_prize_earned(teacher)
    # teacher prizes disabled, but a different mail is sent for now...
    mail to: teacher.email, subject: I18n.t('prize_mail.teacher_prize_earned.subject')
  end

  def teacher_bonus_prize_earned(teacher)
    # teacher bonus prizes disabled
    # mail to: teacher.email, subject: I18n.t('prize_mail.teacher_bonus_prize_earned.subject')
  end
end
