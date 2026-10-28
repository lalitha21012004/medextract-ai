import magic
from django.core.exceptions import ValidationError

MAX_FILE_SIZE_BYTES=10*1024*1024

ALLOWED_MIME_TYPES=[
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
]

ALLOWED_EXTENSIONS=[".pdf",".jpg",".jpeg",".png"]

def validate_report_file(file_obj):
    #Validates uploaded medical report files for size extension and true MIME type

    #1.Validate File Size
    if file_obj.size>MAX_FILE_SIZE_BYTES:
        raise ValidationError("file size exceeds maximum limit of 10MB")

    #2.Validate Extension
    file_name=file_obj.name.lower()
    if not any (file_name.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise ValidationError("Unsupported file extensions.Allowed formats: PDF,JPEG,JPG,PNG")


    #3.Validate MIME type using Magic Bytes
    #Read the first 2048 bytes to detect the mime type
    initial_bytes=file_obj.read(2048)
    file_obj.seek(0)

    mime_type=magic.from_buffer(initial_bytes,mime=True)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise ValidationError(f"Invalid file content type '{mime_type}.Please upload a valid PDf or Image document")

    return file_obj