import React from 'react'
import BigNumbersWidget from './BigNumbersWidget'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  commitTempConfig,
  setTemporaryConfig,
  removeService
} from '../util/actions'

class Email extends BigNumbersWidget {
  constructor (props) {
    super('Email', 'email', props)
  }

  renderWidget () {
    const data = this.getWidgetData()
    return data && this.renderBigNumbers([
      {
        label: 'Unread',
        value: data.unread
      },
      {
        label: 'Flagged',
        value: data.flagged
      }
    ])
  }

  renderEditor () {
    const tempConfig = this.getWidgetTempConfig()
    const mailboxTypes = [
      {
        name: 'exchange',
        label: 'Microsoft Exchange'
      },
      {
        name: 'imap',
        label: 'IMAP'
      }
    ]
    if (tempConfig) {
      return (
        <div className='email-config-mailboxes'>
          {
            tempConfig.mailboxes.map((mailbox, i) => {
              return (
                <div className='widget-editor-section tasks-config-mailbox' key={i}>
                  <div className='widget-editor-input-group'>
                    <label className='widget-editor-label'>Type</label>
                    <select className='widget-editor-input' value={mailbox.type} onChange={(event) => this.setTempConfigArrayIndexValue('mailboxes', i, 'type', mailboxTypes[event.target.selectedIndex - 1].name)}>
                      <option value=''>Select Mailbox</option>
                      {
                        mailboxTypes.map((type, j) => {
                          return (<option key={j} value={type.name}>{type.label}</option>)
                        })
                      }
                    </select>
                  </div>
                  { this.renderMailboxConfig(mailbox, i) }
                  <div className='widget-editor-button-set'>
                    <button className='small destructive' onClick={() => this.removeTempConfigArrayIndex('mailboxes', i)}>Remove Mailbox</button>
                  </div>
                </div>
              )
            })
          }
          <button className='additive' onClick={() => this.addTempConfigArrayObject('mailboxes', {type: '', credentials: {}})}>Add Mailbox</button>
        </div>
      )
    } else {
      return null
    }
  }

  setMailboxCredentialValue (index, key, value) {
    const credentials = Object.assign({}, this.getWidgetTempConfig().mailboxes[index].credentials)
    credentials[key] = value
    this.setTempConfigArrayIndexValue('mailboxes', index, 'credentials', credentials)
  }

  renderMailboxConfig (mailbox, i) {
    switch (mailbox.type) {
      case 'exchange':
        return (
          <div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Server URL</label>
              <input className='widget-editor-input' type='text' value={mailbox.credentials.url} onChange={(event) => this.setMailboxCredentialValue(i, 'url', event.target.value)} />
            </div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Username</label>
              <input className='widget-editor-input' type='text' value={mailbox.credentials.username} onChange={(event) => this.setMailboxCredentialValue(i, 'username', event.target.value)} />
            </div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Password</label>
              <input className='widget-editor-input' type='password' value={mailbox.credentials.password} onChange={(event) => this.setMailboxCredentialValue(i, 'password', event.target.value)} />
            </div>
          </div>
        )
      case 'imap':
        return (
          <div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Hostname</label>
              <input className='widget-editor-input' type='text' value={mailbox.credentials.host} onChange={(event) => this.setMailboxCredentialValue(i, 'host', event.target.value)} />
            </div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Username</label>
              <input className='widget-editor-input' type='text' value={mailbox.credentials.user} onChange={(event) => this.setMailboxCredentialValue(i, 'user', event.target.value)} />
            </div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Password</label>
              <input className='widget-editor-input' type='password' value={mailbox.credentials.password} onChange={(event) => this.setMailboxCredentialValue(i, 'password', event.target.value)} />
            </div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Port</label>
              <input className='widget-editor-input' type='text' value={mailbox.credentials.port} onChange={(event) => this.setMailboxCredentialValue(i, 'port', event.target.value)} />
            </div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>
                <input type='checkbox' checked={mailbox.credentials.tls} onChange={(event) => this.setMailboxCredentialValue(i, 'tls', event.target.checked)} />
                TLS
              </label>
            </div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Flagged Mailbox Name</label>
              <input className='widget-editor-input' type='text' value={mailbox.flagMailboxName} onChange={(event) => this.setTempConfigArrayIndexValue('mailboxes', i, 'flagMailboxName', event.target.value)} />
            </div>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Unread Mailbox Name</label>
              <input className='widget-editor-input' type='text' value={mailbox.unreadMailboxName} onChange={(event) => this.setTempConfigArrayIndexValue('mailboxes', i, 'unreadMailboxName', event.target.value)} />
            </div>
          </div>
        )
      default:
        return null
    }
  }
}

const stateToProps = (state) => {
  return {
    services: state.services
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    commitTempConfig,
    setTemporaryConfig,
    removeService
  }, dispatch)
}

Email.widgetProps = {
  h: 1.5,
  isResizable: false
}

export default connect(stateToProps, dispatchToProps)(Email)
