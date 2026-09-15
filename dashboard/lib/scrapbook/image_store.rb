# Stores scrapbook entry images in S3, keyed by the owning user.
#
# Scrapbook entries are per-user and not necessarily tied to a project channel,
# so we deliberately do NOT use the channel-centric BucketHelper machinery here.
# This is a small, purpose-built wrapper over the AWS::S3 primitives: an image
# lives at "{assets_dir}/scrapbook/{user_id}/{uuid}.{ext}" and only the bare
# "{uuid}.{ext}" filename is persisted in the scrapbook_entries row. The owning
# user is implied by the row (and by the authenticated request when serving), so
# the user id never appears in a client-facing URL.
module Scrapbook
  module ImageStore
    MAX_BYTES = 5 * 1024 * 1024

    # Maps a detected content-type to the extension we store it under. This is
    # also the allowlist: anything that doesn't sniff to one of these is
    # rejected.
    EXTENSION_BY_TYPE = {
      'image/png' => 'png',
      'image/jpeg' => 'jpg',
      'image/gif' => 'gif',
      'image/webp' => 'webp',
    }.freeze

    FILENAME_PATTERN = /\A[0-9a-f-]+\.(?:png|jpg|gif|webp)\z/

    # Images are served through a Rails proxy via an unguessable, tamper-proof
    # token rather than a login session: an <img> tag cannot reliably carry the
    # Devise session cookie (SameSite/format quirks), and the rest of the
    # platform serves private user media the same capability-URL way. The token
    # signs the (user_id, filename) pair so a client can neither forge one nor
    # reach another user's prefix; it expires so a leaked URL is not permanent.
    TOKEN_PURPOSE = 'scrapbook_image'
    TOKEN_TTL = 30.days

    def self.signed_token(user_id, filename)
      message = verifier.generate(
        {'user_id' => user_id, 'filename' => filename},
        purpose: TOKEN_PURPOSE,
        expires_in: TOKEN_TTL
      )
      Base64.urlsafe_encode64(message)
    end

    # Returns {user_id:, filename:} for a valid token, or nil for a forged,
    # corrupt, or expired one.
    def self.verify_token(token)
      message = Base64.urlsafe_decode64(token.to_s)
      payload = verifier.verify(message, purpose: TOKEN_PURPOSE)
      {user_id: payload['user_id'], filename: payload['filename']}
    rescue StandardError
      nil
    end

    def self.verifier
      Rails.application.message_verifier(TOKEN_PURPOSE)
    end

    # Sniffs the image type from the leading bytes rather than trusting the
    # upload's declared Content-Type. Returns an allowlisted content-type
    # string, or nil if the bytes don't match a supported format.
    def self.detect_content_type(data)
      return nil if data.nil? || data.bytesize < 12
      head = data.byteslice(0, 12)
      return 'image/png' if head.start_with?("\x89PNG\r\n\x1A\n".b)
      return 'image/jpeg' if head.start_with?("\xFF\xD8\xFF".b)
      return 'image/gif' if head.start_with?('GIF87a'.b) || head.start_with?('GIF89a'.b)
      if head.byteslice(0, 4) == 'RIFF'.b && head.byteslice(8, 4) == 'WEBP'.b
        return 'image/webp'
      end
      nil
    end

    # Writes image bytes to S3 and returns the bare filename to persist.
    def self.put(user_id, data, content_type)
      ext = EXTENSION_BY_TYPE[content_type] or
        raise ArgumentError, "unsupported content type: #{content_type}"
      filename = "#{SecureRandom.uuid}.#{ext}"
      AWS::S3.upload_to_bucket(
        bucket,
        key(user_id, filename),
        data,
        no_random: true,
        content_type: content_type,
        cache_control: 'private, max-age=3600'
      )
      filename
    end

    # Returns [bytes, content_type] for the user's image, or raises
    # AWS::S3::NoSuchKey if it is missing.
    def self.read(user_id, filename)
      object = AWS::S3.create_client.get_object(bucket: bucket, key: key(user_id, filename))
      [object.body.read, object.content_type]
    rescue Aws::S3::Errors::NoSuchKey
      raise AWS::S3::NoSuchKey, "no such scrapbook image: #{filename}"
    end

    def self.delete(user_id, filename)
      AWS::S3.delete_from_bucket(bucket, key(user_id, filename))
    end

    def self.bucket
      CDO.assets_s3_bucket
    end

    def self.key(user_id, filename)
      "#{CDO.assets_s3_directory}/scrapbook/#{user_id}/#{filename}"
    end
  end
end
