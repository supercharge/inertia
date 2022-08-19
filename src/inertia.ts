'use strict'

import Fs from '@supercharge/fs'
import { createHash } from 'node:crypto'

export class Inertia {
  /**
   * Returns the MD5 hash for the content of the given `manifestFilePath`.
   *
   * @param manifestFilePath
   *
   * @returns {Promise<string>}
   */
  public static async manifestFile (manifestFilePath: string): Promise<string> {
    if (await Fs.exists(manifestFilePath)) {
      const content = await Fs.content(manifestFilePath)

      return createHash('md5').update(content).digest('hex')
    }

    throw new Error(`Manifest file "${manifestFilePath}" does not exist.`)
  }
}
