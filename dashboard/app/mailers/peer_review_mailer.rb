class PeerReviewMailer < ActionMailer::Base
  default from: 'Code.org <teacher@code.org>'

  def review_completed_receipt(peer_review)
    @peer_review = peer_review
    @submission_url = CDO.studio_url @peer_review.submission_path, CDO.default_scheme

    mail(
      to: @peer_review.submitter.email,
      subject: "Your submission for \"#{@peer_review.level.name}\" has been reviewed"
    )
  end
end
