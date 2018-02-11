# frozen_string_literal: true

if defined? GrapeSwaggerRails
  GrapeSwaggerRails.options.url      = '/api/swagger_doc.json'
  GrapeSwaggerRails.options.before_action_proc = proc {
    GrapeSwaggerRails.options.app_url = request.protocol + request.host_with_port
  }
  GrapeSwaggerRails.options.doc_expansion = 'list'
end

