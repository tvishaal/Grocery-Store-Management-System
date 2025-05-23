from smtplib import SMTP 
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

SMTP_HOST = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = 'vishaal@gmail.com'
SENDER_PASSWORD = ''

def send_message(to,subject,message,file=None):
    msgg=MIMEMultipart()
    msgg['From']=SENDER_EMAIL
    msgg['To']=to
    msgg['Subject']=subject
    
    msgg.attach(MIMEText(message,"html"))

    if not file==None:
        with open(file, 'rb') as f:
            attach = MIMEApplication(f.read(), _subtype='zip')
            attach.add_header('Content-Disposition', 'attachment', filename=file)
            msgg.attach(attach)
    
    smt=SMTP(host=SMTP_HOST,port=SMTP_PORT)
    smt.login(SENDER_EMAIL,SENDER_PASSWORD)
    smt.send_message(msgg)
    smt.quit()
    return True